import { Routes, Route } from 'react-router-dom';

import { HomePage } from '@pages/HomePage';
import { LoginPage } from '@pages/LoginPage';
import { RegisterPage } from '@pages/RegisterPage';
import { ProducerSignupPage } from '@pages/ProducerSignupPage';
import { NotFoundPage } from '@pages/NotFoundPage';
import { ThiagoPage } from '@pages/ThiagoPage';

import { BrowsePage } from '@pages/customer/BrowsePage';
import { PublicEventPage } from '@pages/customer/PublicEventPage';
import { OrdersPage as CustomerOrdersPage } from '@pages/customer/OrdersPage';
import { CustomerOrderDetailPage } from '@pages/customer/CustomerOrderDetailPage';
import { TicketsPage } from '@pages/customer/TicketsPage';
import { TicketDetailPage } from '@pages/customer/TicketDetailPage';

import { ProducerDashboardPage } from '@pages/producer/ProducerDashboardPage';
import { ProducerRegisterPage } from '@pages/producer/ProducerRegisterPage';
import { CredentialsPage } from '@pages/producer/CredentialsPage';
import { EventListPage } from '@pages/producer/EventListPage';
import { EventFormPage } from '@pages/producer/EventFormPage';
import { EventDetailPage as ProducerEventDetailPage } from '@pages/producer/EventDetailPage';
import { SalesPage } from '@pages/producer/SalesPage';
import { CustomersPage as ProducerCustomersPage } from '@pages/producer/CustomersPage';
import { TicketScannerPage } from '@pages/producer/TicketScannerPage';
import { ProducerTicketsPage } from '@pages/producer/TicketsPage';
import { CouponsPage as ProducerCouponsPage } from '@pages/producer/CouponsPage';

import { AdminDashboardPage } from '@pages/admin/AdminDashboardPage';
import { ProducersPage } from '@pages/admin/ProducersPage';
import { UsersPage } from '@pages/admin/UsersPage';
import { EventsPage as AdminEventsPage } from '@pages/admin/EventsPage';
import { OrdersPage as AdminOrdersPage } from '@pages/admin/OrdersPage';
import { SettingsPage } from '@pages/admin/SettingsPage';
import { AuditPage } from '@pages/admin/AuditPage';
import { CouponsPage as AdminCouponsPage } from '@pages/admin/CouponsPage';

import { ProtectedRoute } from '@components/ProtectedRoute';
import { RoleRoute } from '@components/RoleRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/cadastro/produtor" element={<ProducerSignupPage />} />

      <Route path="/eventos" element={<BrowsePage />} />
      <Route path="/eventos/:slug" element={<PublicEventPage />} />

      <Route path="/pages/thiago" element={<ThiagoPage />} />

      <Route
        path="/meus-pedidos"
        element={
          <RoleRoute roles={['customer']}>
            <CustomerOrdersPage />
          </RoleRoute>
        }
      />
      <Route
        path="/meus-pedidos/:id"
        element={
          <RoleRoute roles={['customer']}>
            <CustomerOrderDetailPage />
          </RoleRoute>
        }
      />
      <Route
        path="/meus-ingressos"
        element={
          <RoleRoute roles={['customer']}>
            <TicketsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/meus-ingressos/:id"
        element={
          <RoleRoute roles={['customer']}>
            <TicketDetailPage />
          </RoleRoute>
        }
      />

      <Route
        path="/produtor/cadastro"
        element={
          <ProtectedRoute>
            <ProducerRegisterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/produtor"
        element={
          <RoleRoute roles={['producer', 'admin']}>
            <ProducerDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/produtor/eventos"
        element={
          <RoleRoute roles={['producer', 'admin']}>
            <EventListPage />
          </RoleRoute>
        }
      />
      <Route
        path="/produtor/eventos/novo"
        element={
          <RoleRoute roles={['producer', 'admin']}>
            <EventFormPage />
          </RoleRoute>
        }
      />
      <Route
        path="/produtor/eventos/:id"
        element={
          <RoleRoute roles={['producer', 'admin']}>
            <ProducerEventDetailPage />
          </RoleRoute>
        }
      />
      <Route
        path="/produtor/eventos/:id/editar"
        element={
          <RoleRoute roles={['producer', 'admin']}>
            <EventFormPage />
          </RoleRoute>
        }
      />
      <Route
        path="/produtor/credenciais"
        element={
          <RoleRoute roles={['producer', 'admin']}>
            <CredentialsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/produtor/vendas"
        element={
          <RoleRoute roles={['producer', 'admin']}>
            <SalesPage />
          </RoleRoute>
        }
      />
      <Route
        path="/produtor/ingressos"
        element={
          <RoleRoute roles={['producer', 'admin']}>
            <ProducerTicketsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/produtor/clientes"
        element={
          <RoleRoute roles={['producer', 'admin']}>
            <ProducerCustomersPage />
          </RoleRoute>
        }
      />
      <Route
        path="/produtor/leitor"
        element={
          <RoleRoute roles={['producer', 'admin']}>
            <TicketScannerPage />
          </RoleRoute>
        }
      />
      <Route
        path="/produtor/cupons"
        element={
          <RoleRoute roles={['producer', 'admin']}>
            <ProducerCouponsPage />
          </RoleRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <RoleRoute roles={['admin']}>
            <AdminDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/produtores"
        element={
          <RoleRoute roles={['admin']}>
            <ProducersPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <RoleRoute roles={['admin']}>
            <UsersPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/eventos"
        element={
          <RoleRoute roles={['admin']}>
            <AdminEventsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/vendas"
        element={
          <RoleRoute roles={['admin']}>
            <AdminOrdersPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/cupons"
        element={
          <RoleRoute roles={['admin']}>
            <AdminCouponsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/configuracoes"
        element={
          <RoleRoute roles={['admin']}>
            <SettingsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/auditoria"
        element={
          <RoleRoute roles={['admin']}>
            <AuditPage />
          </RoleRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
