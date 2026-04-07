import { Suspense, lazy, type ComponentType } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { AdminShell } from './components/admin/AdminShell';
import { PublicShell } from './components/public/PublicShell';
import { useAuth } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';

const lazyNamed = <TModule extends Record<string, unknown>>(
  load: () => Promise<TModule>,
  exportName: keyof TModule,
) =>
  lazy(async () => {
    const module = await load();
    return { default: module[exportName] as ComponentType<any> };
  });

const Dashboard = lazyNamed(() => import('./pages/Dashboard'), 'Dashboard');
const BuyCrypto = lazyNamed(() => import('./pages/BuyCrypto'), 'BuyCrypto');
const Deposit = lazyNamed(() => import('./pages/Deposit'), 'Deposit');
const Withdraw = lazyNamed(() => import('./pages/Withdraw'), 'Withdraw');
const TransferModePage = lazyNamed(() => import('./pages/TransferModePage'), 'TransferModePage');
const TransferHubPage = lazyNamed(() => import('./pages/TransferHubPage'), 'TransferHubPage');
const TransferAssetPage = lazyNamed(() => import('./pages/TransferAssetPage'), 'TransferAssetPage');
const AssetDetailPage = lazyNamed(() => import('./pages/AssetDetailPage'), 'AssetDetailPage');
const ManageCrypto = lazyNamed(() => import('./pages/ManageCrypto'), 'ManageCrypto');
const CryptoAddress = lazyNamed(() => import('./pages/CryptoAddress'), 'CryptoAddress');
const Notifications = lazyNamed(() => import('./pages/Notifications'), 'Notifications');
const Cards = lazyNamed(() => import('./pages/Cards'), 'Cards');
const Settings = lazyNamed(() => import('./pages/Settings'), 'Settings');
const ProfileSecurity = lazyNamed(() => import('./pages/ProfileSecurity'), 'ProfileSecurity');
const KycVerification = lazyNamed(() => import('./pages/KycVerification'), 'KycVerification');
const Swap = lazyNamed(() => import('./pages/Swap'), 'Swap');
const PublicHome = lazyNamed(() => import('./pages/public/PublicHome'), 'PublicHome');
const PublicServicePage = lazyNamed(() => import('./pages/public/PublicServicePage'), 'PublicServicePage');
const PublicKnowledgePage = lazyNamed(() => import('./pages/public/PublicKnowledgePage'), 'PublicKnowledgePage');
const PublicFaqPage = lazyNamed(() => import('./pages/public/PublicFaqPage'), 'PublicFaqPage');
const PublicLocationsPage = lazyNamed(() => import('./pages/public/PublicLocationsPage'), 'PublicLocationsPage');
const PublicLocationDetailPage = lazyNamed(
  () => import('./pages/public/PublicLocationDetailPage'),
  'PublicLocationDetailPage',
);
const PublicLegalPage = lazyNamed(() => import('./pages/public/PublicLegalPage'), 'PublicLegalPage');
const PublicContactPage = lazyNamed(() => import('./pages/public/PublicContactPage'), 'PublicContactPage');
const LoginPage = lazyNamed(() => import('./pages/auth/LoginPage'), 'LoginPage');
const SignupPage = lazyNamed(() => import('./pages/auth/SignupPage'), 'SignupPage');
const ImpersonatePage = lazyNamed(() => import('./pages/auth/ImpersonatePage'), 'ImpersonatePage');
const Bots = lazyNamed(() => import('./pages/Bots'), 'Bots');
const Referral = lazyNamed(() => import('./pages/Referral'), 'Referral');
const AdminDashboard = lazyNamed(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard');
const AdminUsersPage = lazyNamed(() => import('./pages/admin/AdminUsersPage'), 'AdminUsersPage');
const AdminUserCreatePage = lazyNamed(() => import('./pages/admin/AdminUserCreatePage'), 'AdminUserCreatePage');
const AdminUserDetailPage = lazyNamed(() => import('./pages/admin/AdminUserDetailPage'), 'AdminUserDetailPage');
const AdminUserPasswordPage = lazyNamed(
  () => import('./pages/admin/AdminUserPasswordPage'),
  'AdminUserPasswordPage',
);
const AdminUserRecordsPage = lazyNamed(() => import('./pages/admin/AdminUserRecordsPage'), 'AdminUserRecordsPage');
const AdminKycPage = lazyNamed(() => import('./pages/admin/AdminKycPage'), 'AdminKycPage');
const AdminTransactionsPage = lazyNamed(
  () => import('./pages/admin/AdminTransactionsPage'),
  'AdminTransactionsPage',
);
const AdminSettingsPage = lazyNamed(() => import('./pages/admin/AdminSettingsPage'), 'AdminSettingsPage');
const AdminProfilePage = lazyNamed(() => import('./pages/admin/AdminProfilePage'), 'AdminProfilePage');
const AdminEmailPage = lazyNamed(() => import('./pages/admin/AdminEmailPage'), 'AdminEmailPage');

const FullPageState = ({ message }: { message: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{message}</p>
  </div>
);

const GuestOnly = () => {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return <FullPageState message="Loading session" />;
  }

  if (status === 'authenticated' && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
};

const RequireRole = ({ role }: { role: 'user' | 'admin' }) => {
  const { status, user, bootstrapReady } = useAuth();

  if (status === 'loading') {
    return <FullPageState message="Loading session" />;
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  if (!bootstrapReady) {
    return <FullPageState message="Loading workspace" />;
  }

  return <Outlet />;
};

const AppAliasRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/app${location.pathname}${location.search}${location.hash}`} replace />;
};

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <BrandingProvider>
        <Suspense fallback={<FullPageState message="Loading page" />}>
          <Routes>
            <Route path="/" element={<PublicShell />}>
              <Route index element={<PublicHome />} />
              <Route path="buy-with-cash" element={<PublicServicePage slug="buy-with-cash" />} />
              <Route path="buy-with-e-transfer" element={<PublicServicePage slug="buy-with-e-transfer" />} />
              <Route path="buy-with-wire-transfer" element={<PublicServicePage slug="buy-with-wire-transfer" />} />
              <Route path="otc-trading-desk" element={<PublicServicePage slug="otc-trading-desk" />} />
              <Route path="fees-and-pricing" element={<PublicServicePage slug="fees-and-pricing" />} />
              <Route path="crypto-wallets" element={<PublicKnowledgePage slug="crypto-wallets" />} />
              <Route path="crypto-basics" element={<PublicKnowledgePage slug="crypto-basics" />} />
              <Route path="resources/what-is-bitcoin" element={<PublicKnowledgePage slug="what-is-bitcoin" />} />
              <Route path="resources/crypto-taxes-canada" element={<PublicKnowledgePage slug="crypto-taxes-canada" />} />
              <Route path="resources/vancouver-bitcoin-atm-guide" element={<PublicKnowledgePage slug="vancouver-bitcoin-atm-guide" />} />
              <Route path="faqs" element={<PublicFaqPage />} />
              <Route path="locations" element={<PublicLocationsPage />} />
              <Route path="locations/vancouver" element={<PublicLocationDetailPage slug="vancouver" />} />
              <Route path="locations/calgary" element={<PublicLocationDetailPage slug="calgary" />} />
              <Route path="privacy-policy" element={<PublicLegalPage slug="privacy-policy" />} />
              <Route path="terms-of-service" element={<PublicLegalPage slug="terms-of-service" />} />
              <Route path="contact" element={<PublicContactPage />} />
            </Route>

            <Route path="/impersonate" element={<ImpersonatePage />} />

            <Route element={<GuestOnly />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            <Route element={<RequireRole role="user" />}>
              <Route path="/app" element={<Shell />}>
                <Route index element={<Dashboard />} />
                <Route path="buy" element={<BuyCrypto />} />
                <Route path="swap" element={<Swap />} />
                <Route path="send" element={<TransferModePage />} />
                <Route path="send/:method" element={<TransferHubPage />} />
                <Route path="send/:method/:symbol/:network" element={<TransferAssetPage />} />
                <Route path="receive" element={<TransferModePage />} />
                <Route path="receive/:method" element={<TransferHubPage />} />
                <Route path="receive/:method/:symbol/:network" element={<TransferAssetPage />} />
                <Route path="deposit" element={<Deposit />} />
                <Route path="withdraw" element={<Withdraw />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<ProfileSecurity />} />
                <Route path="kyc" element={<KycVerification />} />
                <Route path="crypto-manage" element={<ManageCrypto />} />
                <Route path="crypto-address" element={<CryptoAddress />} />
                <Route path="crypto/details/:symbol/:network" element={<AssetDetailPage />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="cards" element={<Cards />} />
                <Route path="bots" element={<Bots />} />
                <Route path="referral" element={<Referral />} />
              </Route>
            </Route>

            <Route element={<RequireRole role="admin" />}>
              <Route path="/admin" element={<AdminShell />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="users/create" element={<AdminUserCreatePage />} />
                <Route path="users/:id" element={<AdminUserDetailPage />} />
                <Route path="users/:id/password" element={<AdminUserPasswordPage />} />
                <Route path="users/:id/crypto" element={<AdminUserRecordsPage />} />
                <Route path="users/:id/cards" element={<AdminUserRecordsPage />} />
                <Route path="kyc" element={<AdminKycPage />} />
                <Route path="transactions" element={<AdminTransactionsPage />} />
                <Route path="settings/general" element={<AdminSettingsPage />} />
                <Route path="settings/email" element={<AdminSettingsPage />} />
                <Route path="settings/wallets" element={<AdminSettingsPage />} />
                <Route path="broadcasts" element={<AdminEmailPage />} />
                <Route path="email" element={<Navigate to="/admin/broadcasts" replace />} />
                <Route path="profile" element={<AdminProfilePage />} />
              </Route>
            </Route>

            <Route path="/dashboard" element={<Navigate to="/app" replace />} />
            <Route path="/buy" element={<Navigate to="/app/buy" replace />} />
            <Route path="/swap" element={<Navigate to="/app/swap" replace />} />
            <Route path="/send" element={<Navigate to="/app/send" replace />} />
            <Route path="/send/:method" element={<AppAliasRedirect />} />
            <Route path="/send/:method/:symbol/:network" element={<AppAliasRedirect />} />
            <Route path="/receive" element={<Navigate to="/app/receive" replace />} />
            <Route path="/receive/:method" element={<AppAliasRedirect />} />
            <Route path="/receive/:method/:symbol/:network" element={<AppAliasRedirect />} />
            <Route path="/deposit" element={<Navigate to="/app/deposit" replace />} />
            <Route path="/withdraw" element={<Navigate to="/app/withdraw" replace />} />
            <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
            <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
            <Route path="/kyc" element={<Navigate to="/app/kyc" replace />} />
            <Route path="/crypto-manage" element={<Navigate to="/app/crypto-manage" replace />} />
            <Route path="/crypto-address" element={<Navigate to="/app/crypto-address" replace />} />
            <Route path="/crypto/details/:symbol/:network" element={<AppAliasRedirect />} />
            <Route path="/notifications" element={<Navigate to="/app/notifications" replace />} />
            <Route path="/cards" element={<Navigate to="/app/cards" replace />} />
            <Route path="/bots" element={<Navigate to="/app/bots" replace />} />
            <Route path="/referral" element={<Navigate to="/app/referral" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrandingProvider>
    </BrowserRouter>
  );
}

export default App;
