import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BizNapkin',
  description: 'Back-of-the-napkin business viability calculator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-gray-900 antialiased bg-pattern">
        <header className="glass border-0 shadow-sm">
          <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="font-bold text-xl gradient-text">BizNapkin</a>
            <nav className="text-sm space-x-6">
              <a href="/" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">Calculator</a>
              <a href="#" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">About</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="glass border-0 mt-12">
          <div className="mx-auto max-w-4xl px-4 py-6 text-sm text-gray-600 text-center">
            © {new Date().getFullYear()} BizNapkin - Built with ❤️ for entrepreneurs
          </div>
        </footer>
      </body>
    </html>
  );
}

