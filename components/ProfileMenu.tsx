import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@hooks/useAuth';
import { useToast } from './Toast';
import { Avatar } from './Avatar';
import { ProfileModal } from './ProfileModal';
import { Icons } from './Icon';

export function ProfileMenu() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/login" className="btn btn-ghost">
          {t('menu.signIn')}
        </Link>
        <Link to="/cadastro" className="btn btn-primary">
          {t('menu.createAccount')}
        </Link>
      </div>
    );
  }

  async function handleLogout() {
    await logout();
    setOpen(false);
    toast.info(t('menu.sessionEnded'));
    navigate('/login', { replace: true });
  }

  const roleLabel: Record<string, string> = {
    admin: t('roles.admin'),
    producer: t('roles.producer'),
    customer: t('roles.customer'),
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/60 bg-white/60 py-1.5 pl-1.5 pr-4 backdrop-blur transition hover:bg-white"
      >
        <Avatar name={user.name} size="sm" />
        <div className="text-left">
          <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 leading-tight">{roleLabel[user.role]}</p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-glass-lg backdrop-blur-xl animate-fade-up">
          <div className="flex items-center gap-3 border-b border-white/50 bg-gradient-to-br from-brand-500/10 to-accent-500/10 p-4">
            <Avatar name={user.name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="py-1">
            <MenuItem
              onClick={() => { setOpen(false); setEditOpen(true); }}
              icon={<Icons.user className="h-4 w-4" />}
              label={t('menu.editProfile')}
            />
            {user.role === 'customer' && (
              <>
                <MenuLink to="/meus-pedidos" icon={<Icons.bag className="h-4 w-4" />} label={t('menu.myOrders')} onClick={() => setOpen(false)} />
                <MenuLink to="/meus-ingressos" icon={<Icons.ticket className="h-4 w-4" />} label={t('menu.myTickets')} onClick={() => setOpen(false)} />
              </>
            )}
            {user.role === 'producer' && (
              <MenuLink to="/produtor" icon={<Icons.chart className="h-4 w-4" />} label={t('menu.producerPanel')} onClick={() => setOpen(false)} />
            )}
            {user.role === 'admin' && (
              <MenuLink to="/admin" icon={<Icons.shield className="h-4 w-4" />} label={t('menu.adminPanel')} onClick={() => setOpen(false)} />
            )}
            <div className="my-1 border-t border-white/50" />
            <MenuItem
              onClick={handleLogout}
              icon={<Icons.logout className="h-4 w-4" />}
              label={t('menu.signOut')}
              destructive
            />
          </div>
        </div>
      )}

      <ProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}

function MenuItem({ icon, label, onClick, destructive }: { icon: React.ReactNode; label: string; onClick?: () => void; destructive?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition hover:bg-white/80 ${
        destructive ? 'text-rose-600 hover:text-rose-700' : 'text-slate-700 hover:text-slate-900'
      }`}
    >
      <span className="text-slate-500">{icon}</span>
      {label}
    </button>
  );
}

function MenuLink({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-white/80 hover:text-slate-900"
    >
      <span className="text-slate-500">{icon}</span>
      {label}
    </Link>
  );
}
