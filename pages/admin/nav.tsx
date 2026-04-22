import { Icons } from '@components/Icon';

export const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: <Icons.chart className="h-4 w-4" /> },
  { to: '/admin/produtores', label: 'Produtores', icon: <Icons.users className="h-4 w-4" /> },
  { to: '/admin/usuarios', label: 'Usuários', icon: <Icons.user className="h-4 w-4" /> },
  { to: '/admin/eventos', label: 'Eventos', icon: <Icons.calendar className="h-4 w-4" /> },
  { to: '/admin/vendas', label: 'Vendas', icon: <Icons.bag className="h-4 w-4" /> },
  { to: '/admin/cupons', label: 'Cupons', icon: <Icons.sparkles className="h-4 w-4" /> },
  { to: '/admin/configuracoes', label: 'Configurações', icon: <Icons.settings className="h-4 w-4" /> },
  { to: '/admin/auditoria', label: 'Auditoria', icon: <Icons.shield className="h-4 w-4" /> },
];
