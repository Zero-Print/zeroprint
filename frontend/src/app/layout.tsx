import { Inter, Poppins, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/modules/auth/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { NavigationProvider } from '@/modules/navigation/NavigationContext';
import { GlobalErrorBoundary } from '@/lib/errorBoundary';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

export const metadata = {
  title: 'ZeroPrint - AI-Powered Sustainability Platform',
  description: 'India\'s first gamified sustainability engagement platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${robotoMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-inter">
        <AuthProvider>
          <NavigationProvider>
            <AppLayout>
              <GlobalErrorBoundary>
                {children}
              </GlobalErrorBoundary>
            </AppLayout>
          </NavigationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
