import type { Metadata } from "next";
import "./globals.css";
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: "Saath-Saath - Street Food Vendor Platform",
  description: "Hyperlocal sourcing platform for India's street food vendors",
};

// Dynamic import of AuthProvider to prevent hydration issues
const AuthProvider = dynamic(
  () => import('@/contexts/AuthContext').then(mod => ({ default: mod.AuthProvider })),
  {
    ssr: true,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
