import { NavLink } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Bell, CircleDollarSign, Home } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MobileNav = () => {
  const items = [
    { name: 'Home', href: '/app', icon: Home, end: true },
    { name: 'Buy', href: '/app/buy', icon: CircleDollarSign },
    { name: 'Receive', href: '/app/receive', icon: ArrowDownLeft },
    { name: 'Send', href: '/app/send', icon: ArrowUpRight },
    { name: 'Alerts', href: '/app/notifications', icon: Bell },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-lg border-t border-gray-800 py-2 px-6">
      <div className="flex items-center justify-between gap-1">
        {items.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.end}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 transition-all duration-200 min-w-[50px]",
              isActive ? "text-primary scale-110" : "text-gray-500"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
