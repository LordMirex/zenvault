import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { AnimatePresence, motion } from 'framer-motion';
import { isImpersonating, exitImpersonation } from '../../lib/api';

export const Shell = () => {
  const location = useLocation();
  const impersonating = isImpersonating();

  const handleExitImpersonation = () => {
    exitImpersonation();
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="wallet-theme-scope flex h-screen overflow-hidden bg-dark-900 text-gray-100 font-sans selection:bg-primary/30 selection:text-primary">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {impersonating && (
          <div className="flex shrink-0 items-center justify-between gap-4 bg-amber-400 px-4 py-2 text-amber-950">
            <span className="text-xs font-bold uppercase tracking-wide">Admin view — logged in as client</span>
            <button
              onClick={handleExitImpersonation}
              className="rounded bg-amber-700 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-amber-800"
            >
              Return to Admin
            </button>
          </div>
        )}

        <Navbar />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto mb-20 w-full max-w-7xl p-4 md:mb-0 md:p-8 lg:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
};
