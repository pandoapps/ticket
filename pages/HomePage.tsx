import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { BrowsePage } from './customer/BrowsePage';

export function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-slate-500">Carregando...</span>
      </div>
    );
  }

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'producer') return <Navigate to="/produtor" replace />;

  return <BrowsePage />;
}
