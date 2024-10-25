import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from '@/components/contexts/AuthContext';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Journey House Onboarding",
  description: "Participant onboarding form",
  icons: {
    icon: [
      {
        url: '/images/JourneyHouse.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/images/Favcon/JHFavcon.png',
        type: 'image/png',
        sizes: '48x48'
      }
    ],
    apple: [
      {
        url: '/images/Favcon/AppleFavconJH.png',
        type: 'image/png',
        sizes: '180x180'
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}