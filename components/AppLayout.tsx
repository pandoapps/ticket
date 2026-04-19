import { NavLink, Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ProfileMenu } from './ProfileMenu';

interface NavItem {
  to: string;
  label: string;
  icon?: ReactNode;
}

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  nav: NavItem[];
  children: ReactNode;
}

export function AppLayout({ title, subtitle, nav, children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <aside className="fixed inset-y-4 left-4 hidden w-60 flex-col rounded-3xl border border-white/50 bg-white/60 p-5 shadow-glass backdrop-blur-xl md:flex">
        <Link to="/" className="mb-6 block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-600">Ticketeira</p>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-500/30'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                }`
              }
            >
              {item.icon && <span className="h-4 w-4">{item.icon}</span>}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="md:ml-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/40 bg-white/50 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="md:hidden">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-600">Ticketeira</p>
            <h1 className="text-sm font-semibold text-slate-900">{title}</h1>
          </div>
          <div className="hidden md:block" />
          <ProfileMenu />
        </header>

        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}
