import { Icons } from '@components/Icon';

export const producerNav = [
  { to: '/produtor', label: 'Dashboard', icon: <Icons.chart className="h-4 w-4" /> },
  { to: '/produtor/eventos', label: 'Eventos', icon: <Icons.calendar className="h-4 w-4" /> },
  { to: '/produtor/ingressos', label: 'Ingressos', icon: <Icons.ticket className="h-4 w-4" /> },
  { to: '/produtor/leitor', label: 'Leitor de ingressos', icon: <Icons.ticket className="h-4 w-4" /> },
  { to: '/produtor/vendas', label: 'Vendas', icon: <Icons.bag className="h-4 w-4" /> },
  { to: '/produtor/credenciais', label: 'Abacate Pay', icon: <Icons.key className="h-4 w-4" /> },
];
