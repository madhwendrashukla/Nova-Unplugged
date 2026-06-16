'use client'

import { useState, useEffect } from 'react'

export function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date()
      let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      }

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }

      return timeLeft
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex gap-3 justify-center text-center relative z-10 w-full mt-2">
      <div className="flex flex-col items-center">
        <span className="font-display font-black text-3xl sm:text-4xl text-white drop-shadow-md">{timeLeft.days}</span>
        <span className="text-white/70 font-bold text-[8px] uppercase tracking-widest mt-1">Days</span>
      </div>
      <span className="font-display font-black text-3xl sm:text-4xl text-white/40">:</span>
      <div className="flex flex-col items-center">
        <span className="font-display font-black text-3xl sm:text-4xl text-white drop-shadow-md">{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="text-white/70 font-bold text-[8px] uppercase tracking-widest mt-1">Hrs</span>
      </div>
      <span className="font-display font-black text-3xl sm:text-4xl text-white/40">:</span>
      <div className="flex flex-col items-center">
        <span className="font-display font-black text-3xl sm:text-4xl text-white drop-shadow-md">{timeLeft.minutes.toString().padStart(2, '0')}</span>
        <span className="text-white/70 font-bold text-[8px] uppercase tracking-widest mt-1">Min</span>
      </div>
      <span className="font-display font-black text-3xl sm:text-4xl text-white/40">:</span>
      <div className="flex flex-col items-center">
        <span className="font-display font-black text-3xl sm:text-4xl text-[#8e44ad] drop-shadow-md">{timeLeft.seconds.toString().padStart(2, '0')}</span>
        <span className="text-white/70 font-bold text-[8px] uppercase tracking-widest mt-1">Sec</span>
      </div>
    </div>
  )
}
