"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Bell, Droplets, Sparkles } from "lucide-react";
import { useAppContext } from "@/lib/context";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const pathname = usePathname();
  const { alertasNoLeidas } = useAppContext();

  const navItems = [
    { href: "/", icon: Home },
    { href: "/historial", icon: History },
    { href: "/eco-coach", icon: Sparkles },
    { href: "/alertas", icon: Bell, badge: alertasNoLeidas },
    { href: "/cuenta", icon: Droplets },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-[430px] bg-background/80 backdrop-blur-md border-t border-border z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="relative p-2 flex flex-col items-center justify-center transition-colors"
            >
              <Icon 
                className={cn(
                  "w-6 h-6 transition-all duration-200", 
                  isActive ? "text-primary scale-110" : "text-muted hover:text-gray-300"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-background">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
