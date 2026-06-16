const urls = [
  'https://www.linkedin.com/in/ishaan-jha-2b6977340/',
  'https://www.linkedin.com/in/madhwendra-shukla-77a13920b/',
  'https://www.linkedin.com/in/ashutosh-agrawal-0a4a7a379/'
];
async function fetchImages() {
  for (const url of urls) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
      const t = await r.text();
      const m = t.match(/<meta property="og:image" content="([^"]+)"/);
      console.log(url, m ? m[1] : 'Not found');
    } catch(e) {
      console.log(url, e.message);
    }
  }
}
fetchImages();
