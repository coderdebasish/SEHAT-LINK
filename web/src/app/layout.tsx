import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SEHAT-LINK — Integrated Rural Healthcare Platform',
    template: '%s | SEHAT-LINK',
  },
  description:
    'SEHAT-LINK connects patients, health workers, doctors, pharmacies and facilities across rural Maharashtra through one unified digital health platform.',
  keywords: ['healthcare', 'rural health', 'digital health', 'SEHAT-LINK', 'Maharashtra', 'telemedicine'],
  authors: [{ name: 'SEHAT-LINK Team' }],
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
