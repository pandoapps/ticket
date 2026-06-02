import { Icons } from '@components/Icon';

export const producerNav = [
  { to: '/produtor', label: 'nav.dashboard', icon: <Icons.chart className="h-4 w-4" /> },
  { to: '/produtor/eventos', label: 'nav.events', icon: <Icons.calendar className="h-4 w-4" /> },
  { to: '/produtor/ingressos', label: 'nav.tickets', icon: <Icons.ticket className="h-4 w-4" /> },
  { to: '/produtor/leitor', label: 'nav.ticketScanner', icon: <Icons.ticket className="h-4 w-4" /> },
  { to: '/produtor/vendas', label: 'nav.sales', icon: <Icons.bag className="h-4 w-4" /> },
  { to: '/produtor/cupons', label: 'nav.coupons', icon: <Icons.sparkles className="h-4 w-4" /> },
  { to: '/produtor/clientes', label: 'nav.customers', icon: <Icons.users className="h-4 w-4" /> },
  { to: '/produtor/bilheteria', label: 'nav.pos', icon: <Icons.bag className="h-4 w-4" /> },
  { to: '/produtor/emails', label: 'nav.emailLogs', icon: <Icons.check className="h-4 w-4" /> },
  { to: '/produtor/credenciais', label: 'nav.abacatePay', icon: <Icons.key className="h-4 w-4" /> },
];
