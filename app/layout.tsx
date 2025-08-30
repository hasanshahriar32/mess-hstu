import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import './globals.css'

export const metadata: Metadata = {
  title: 'HSTU Mess Finder',
  description: 'Find and manage mess accommodations near HSTU campus.',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['HSTU', 'mess', 'accommodation', 'students', 'hostel', 'bangladesh'],
  authors: [
    { name: 'Ashikul Islam' },
  ],
  creator: 'Ashikul Islam',
  publisher: 'HSTU Mess Finder',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://hstu-mess-finder.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'HSTU Mess Finder',
    description: 'Find and manage mess accommodations near HSTU campus.',
    siteName: 'HSTU Mess Finder',
    images: [
      {
        url: '/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'HSTU Mess Finder Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HSTU Mess Finder',
    description: 'Find and manage mess accommodations near HSTU campus.',
    images: ['/icon-512x512.png'],
  },
  icons: {
    icon: '/icon-32x32.png',
    shortcut: '/icon-16x16.png',
    apple: '/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HSTU Mess Finder',
    startupImage: '/icon-512x512.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ea580c' },
    { media: '(prefers-color-scheme: dark)', color: '#ea580c' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}
