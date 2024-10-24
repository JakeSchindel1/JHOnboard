import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
        sizes: '48x48'  // or whatever size your PNG is
      }
    ],
    apple: [
      {
        url: '/images/Favcon/AppleFavconJH.png',
        type: 'image/png',
        sizes: '180x180'  // recommended size for Apple devices
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
        {children}
      </body>
    </html>
  );
}