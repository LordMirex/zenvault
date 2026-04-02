import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { AnimatePresence, motion } from 'framer-motion';

export const Shell = () => {
  const location = useLocation();

  return (
    <div className="wallet-theme-scope flex h-screen overflow-hidden bg-dark-900 text-gray-100 font-sans selection:bg-primary/30 selection:text-primary">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
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
