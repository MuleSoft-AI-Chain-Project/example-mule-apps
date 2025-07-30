// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MAC Knowledge Store',
  description: 'Upload documents to a local vector store',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen`}>
        <div className="w-full">
          {children}
        </div>
      </body>
    </html>
  )
}
