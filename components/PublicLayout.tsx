import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ProfileMenu } from './ProfileMenu';

interface PublicLayoutProps {
  children: ReactNode;
  wide?: boolean;
}

export function PublicLayout({ children, wide = false }: PublicLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link to="/" className="group flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-500/25 transition group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M2 9c1.657 0 3-1.343 3-3h14c0 1.657 1.343 3 3 3v6c-1.657 0-3 1.343-3 3H5c0-1.657-1.343-3-3-3zm6 2a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z" />
              </svg>
            </span>
            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-600">Ticketeira</p>
              <p className="text-sm font-semibold text-slate-900">Let's make it happen</p>
            </div>
          </Link>
          <ProfileMenu />
        </div>
      </header>

      <main className={wide ? '' : 'mx-auto max-w-6xl px-4 py-8 md:px-8'}>{children}</main>

      <footer className="mt-16 border-t border-white/40 bg-white/30 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-8 text-xs text-slate-500 md:px-8">
          <p>
            © {new Date().getFullYear()} Ticketeira. Pagamentos processados via <span className="font-semibold">Abacate Pay</span>.
          </p>
        </div>
      </footer>
    </div>
  );
}
