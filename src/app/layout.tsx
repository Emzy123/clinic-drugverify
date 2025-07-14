import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CUSTECH DrugVerify',
  description: 'Drug verification app for CUSTECH Clinic',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
         <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Logo />
                  <span className="text-lg">CUSTECH DrugVerify</span>
                </Link>
                <div className="flex flex-1 items-center justify-end space-x-4">
                  <UserNav />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="py-6 md:px-8 md:py-0 bg-background/95 border-t">
              <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                  Informational use only; always verify with NAFDAC for definitive confirmation.
                </p>
              </div>
            </footer>
          </div>
        <Toaster />
      </body>
    </html>
  );
}
