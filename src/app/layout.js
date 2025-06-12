'use client'

import "./globals.css";

import { useIdleTimer } from 'react-idle-timer/legacy'
import { useRouter } from 'next/navigation'

export default function RootLayout({ children }) {
  const router = useRouter()

  const onIdle = () => {
    router.push('/')
  }

  const { getRemainingTime } = useIdleTimer({
    onIdle,
    timeout: 60000,
    throttle: 500
  })

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
