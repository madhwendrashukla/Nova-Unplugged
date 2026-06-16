import subprocess
import sys

# Install required packages BEFORE importing them
packages = ['opencv-python', 'pillow', 'moviepy', 'scipy', 'numpy']
for package in packages:
    try:
        if package == 'opencv-python':
            __import__('cv2')
        elif package == 'pillow':
            __import__('PIL')
        else:
            __import__(package.split('-')[0])
    except ImportError:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', package])

import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import moviepy.editor as mp
from scipy.ndimage import gaussian_filter
import os

class HDRVideoAnimator:
    def __init__(self, input_image_path, output_path="nova_unplugged_hdr.mp4"):
        self.input_path = input_image_path
        self.output_path = output_path
        self.fps = 30
        self.duration = 10  # 10 second loop
        self.width = 1920
        self.height = 1080
        
    def load_and_prepare_image(self):
        img = Image.open(self.input_path).convert('RGBA')
        img = img.resize((self.width, self.height), Image.Resampling.LANCZOS)
        return np.array(img)
    
    def segment_layers(self, img):
        layers = {}
        img_hsv = cv2.cvtColor(img[:,:,:3], cv2.COLOR_RGB2HSV)
        
        dark_mask = img_hsv[:,:,2] < 50
        layers['background'] = img.copy()
        layers['background'][~dark_mask] = [0, 0, 0, 0]
        
        golden_mask = (img_hsv[:,:,0] >= 15) & (img_hsv[:,:,0] <= 35) & (img_hsv[:,:,1] > 100)
        layers['clouds'] = img.copy()
        layers['clouds'][~golden_mask] = [0, 0, 0, 0]
        
        top_region = np.zeros_like(dark_mask)
        top_region[:150, :] = True
        swirl_mask = golden_mask & top_region
        layers['top_swirls'] = img.copy()
        layers['top_swirls'][~swirl_mask] = [0, 0, 0, 0]
        
        bottom_region = np.zeros_like(dark_mask)
        bottom_region[700:, :] = True
        fan_mask = bottom_region
        layers['fans'] = img.copy()
        layers['fans'][~fan_mask] = [0, 0, 0, 0]
        
        bright_mask = (img_hsv[:,:,2] > 150) | ((img[:,:,0] > 150) & (img[:,:,1] < 100) & (img[:,:,2] < 100))
        center_region = np.zeros_like(dark_mask)
        center_region[100:700, :] = True
        text_mask = bright_mask & center_region
        layers['text'] = img.copy()
        layers['text'][~text_mask] = [0, 0, 0, 0]
        
        layers['background_inpainted'] = self.inpaint_background(img, ~dark_mask)
        
        return layers
    
    def inpaint_background(self, img, mask):
        result = img.copy()
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
        dilated_mask = cv2.dilate(mask.astype(np.uint8), kernel, iterations=3)
        
        for i in range(3):
            channel = img[:,:,i].astype(float)
            inpainted = gaussian_filter(channel, sigma=20)
            result[:,:,i] = np.where(dilated_mask, inpainted, channel).astype(np.uint8)
        
        return result
    
    def create_animation_frame(self, layers, frame_num, total_frames):
        t = frame_num / total_frames
        
        canvas = np.zeros((self.height, self.width, 4), dtype=np.uint8)
        
        bg = layers['background_inpainted']
        scale = 1.0 + 0.02 * np.sin(2 * np.pi * t)
        bg_animated = self.scale_layer(bg, scale)
        canvas = self.blend_layers(canvas, bg_animated)
        
        clouds = layers['clouds']
        offset_x = int(30 * np.sin(2 * np.pi * t))
        offset_y = int(10 * np.sin(4 * np.pi * t))
        clouds_animated = self.translate_layer(clouds, offset_x, offset_y)
        clouds_animated = self.adjust_opacity(clouds_animated, 0.9 + 0.1 * np.sin(2 * np.pi * t))
        canvas = self.blend_layers(canvas, clouds_animated)
        
        swirls = layers['top_swirls']
        angle = 3 * np.sin(2 * np.pi * t)
        swirls_animated = self.rotate_layer(swirls, angle, center=(self.width//2, 75))
        canvas = self.blend_layers(canvas, swirls_animated)
        
        fans = layers['fans']
        fan_scale = 1.0 + 0.03 * np.sin(2 * np.pi * t * 1.5)
        fans_animated = self.scale_layer(fans, fan_scale, center=(self.width//2, 850))
        canvas = self.blend_layers(canvas, fans_animated)
        
        text = layers['text']
        glow_intensity = 1.0 + 0.15 * np.sin(2 * np.pi * t * 2)
        text_animated = self.add_glow(text, glow_intensity)
        text_animated = self.center_nova_text(text_animated)
        canvas = self.blend_layers(canvas, text_animated)
        
        return canvas[:,:,:3]
    
    def center_nova_text(self, layer):
        text_mask = (layer[:,:,3] > 0) & (layer[:,:,2] > 200)
        if np.any(text_mask):
            coords = np.column_stack(np.where(text_mask))
            if len(coords) > 0:
                y_coords, x_coords = coords[:, 0], coords[:, 1]
                text_center_x = (x_coords.min() + x_coords.max()) // 2
                shift_x = self.width // 2 - text_center_x
                if abs(shift_x) > 5:
                    layer = self.translate_layer(layer, shift_x, 0)
        return layer
    
    def scale_layer(self, layer, scale, center=None):
        if center is None:
            center = (self.width // 2, self.height // 2)
        
        h, w = layer.shape[:2]
        M = cv2.getRotationMatrix2D(center, 0, scale)
        return cv2.warpAffine(layer, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0,0,0,0))
    
    def translate_layer(self, layer, offset_x, offset_y):
        M = np.float32([[1, 0, offset_x], [0, 1, offset_y]])
        return cv2.warpAffine(layer, M, (self.width, self.height), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)
    
    def rotate_layer(self, layer, angle, center):
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        return cv2.warpAffine(layer, M, (self.width, self.height), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0,0,0,0))
    
    def adjust_opacity(self, layer, opacity):
        result = layer.copy()
        result[:,:,3] = (result[:,:,3] * opacity).astype(np.uint8)
        return result
    
    def add_glow(self, layer, intensity):
        result = layer.copy()
        blurred = cv2.GaussianBlur(result, (15, 15), 5)
        glowed = cv2.addWeighted(result, 1.0, blurred, intensity * 0.5, 0)
        return glowed
    
    def blend_layers(self, base, overlay):
        if overlay.shape[2] == 4:
            alpha = overlay[:,:,3:4] / 255.0
            result = base.copy()
            result[:,:,:3] = (1 - alpha) * base[:,:,:3] + alpha * overlay[:,:,:3]
            result[:,:,3] = np.maximum(base[:,:,3], overlay[:,:,3])
            return result
        return base
    
    def apply_hdr_grading(self, frame):
        frame_float = frame.astype(np.float32) / 255.0
        
        frame_hsv = cv2.cvtColor(frame_float, cv2.COLOR_RGB2HSV)
        frame_hsv[:,:,1] = np.clip(frame_hsv[:,:,1] * 1.3, 0, 1)
        frame_hsv[:,:,2] = np.clip(frame_hsv[:,:,2] * 1.1, 0, 1)
        frame_enhanced = cv2.cvtColor(frame_hsv, cv2.COLOR_HSV2RGB)
        
        frame_enhanced = np.power(frame_enhanced, 0.9)
        
        blurred = cv2.GaussianBlur(frame_enhanced, (0, 0), 3.0)
        frame_enhanced = cv2.addWeighted(frame_enhanced, 1.5, blurred, -0.5, 0)
        
        frame_enhanced = np.clip(frame_enhanced * 255, 0, 255).astype(np.uint8)
        
        return frame_enhanced
    
    def generate_video(self):
        print("Loading and preparing image...")
        img = self.load_and_prepare_image()
        
        print("Segmenting layers...")
        layers = self.segment_layers(img)
        
        print("Generating animated frames...")
        total_frames = int(self.duration * self.fps)
        frames = []
        
        for i in range(total_frames):
            if i % 30 == 0:
                print(f"  Rendering frame {i}/{total_frames}")
            
            frame = self.create_animation_frame(layers, i, total_frames)
            frame_hdr = self.apply_hdr_grading(frame)
            frames.append(frame_hdr)
        
        print("Encoding video with HDR settings...")
        clip = mp.ImageSequenceClip(frames, fps=self.fps)
        
        clip.write_videofile(
            self.output_path,
            codec='libx264',
            bitrate='20M',
            preset='slow',
            ffmpeg_params=[
                '-pix_fmt', 'yuv420p',
                '-color_primaries', 'bt2020',
                '-color_trc', 'smpte2084',
                '-colorspace', 'bt2020nc'
            ]
        )
        
        return self.output_path

if __name__ == "__main__":
    INPUT_IMAGE = r"C:\Users\ishaa\.gemini\antigravity-ide\brain\0eb48b2b-1dba-4fcc-aa58-00375ff14015\media__1779772822512.jpg"
    OUTPUT_VIDEO = r"d:\nova latest\public\nova_unplugged_animated_hdr.mp4"
    
    animator = HDRVideoAnimator(INPUT_IMAGE, OUTPUT_VIDEO)
    video_path = animator.generate_video()
    
    print("\n🎬 ANIMATION COMPLETE!")
    print(f"Download your HDR video: {video_path}")
