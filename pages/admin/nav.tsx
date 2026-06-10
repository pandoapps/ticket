import { Icons } from '@components/Icon';

export const adminNav = [
  { to: '/admin', label: 'nav.dashboard', icon: <Icons.chart className="h-4 w-4" /> },
  { to: '/admin/produtores', label: 'nav.producers', icon: <Icons.users className="h-4 w-4" /> },
  { to: '/admin/usuarios', label: 'nav.users', icon: <Icons.user className="h-4 w-4" /> },
  { to: '/admin/eventos', label: 'nav.events', icon: <Icons.calendar className="h-4 w-4" /> },
  { to: '/admin/vendas', label: 'nav.sales', icon: <Icons.bag className="h-4 w-4" /> },
  { to: '/admin/ingressos', label: 'nav.tickets', icon: <Icons.ticket className="h-4 w-4" /> },
  { to: '/admin/cupons', label: 'nav.coupons', icon: <Icons.sparkles className="h-4 w-4" /> },
  { to: '/admin/bilheteria', label: 'nav.pos', icon: <Icons.bag className="h-4 w-4" /> },
  { to: '/admin/configuracoes', label: 'nav.settings', icon: <Icons.settings className="h-4 w-4" /> },
  { to: '/admin/auditoria', label: 'nav.audit', icon: <Icons.shield className="h-4 w-4" /> },
  { to: '/admin/emails', label: 'nav.emailLogs', icon: <Icons.check className="h-4 w-4" /> },
];
