import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Auction Kit - Next.js Example',
  description: 'Demo app for Auction Kit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}

