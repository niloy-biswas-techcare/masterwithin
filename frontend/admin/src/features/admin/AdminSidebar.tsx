"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Tablet,
  GraduationCap,
  Gift,
  FileText,
  Map,
  ShoppingBag,
  Settings,
  Video,
  MessageCircle,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/ebooks", label: "eBooks", icon: Tablet },
  { href: "/courses", label: "Courses", icon: GraduationCap },
  { href: "/freebies", label: "Freebies", icon: Gift },
  { href: "/articles", label: "Articles", icon: FileText },
  { href: "/media", label: "Media", icon: Video },
  { href: "/start-here", label: "Start Here", icon: Map },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/contacts", label: "Messages", icon: MessageCircle },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 shrink-0 border-r border-border bg-surface flex flex-col"
      aria-label="Admin navigation"
    >
      <div className="h-16 flex items-center px-5 border-b border-border">
        <span className="font-display font-semibold text-text text-lg">
          Master Within
        </span>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto" aria-label="Main navigation">
        <ul role="list" className="space-y-0.5 px-2">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      active
                        ? "bg-deep/10 text-deep"
                        : "text-dark hover:bg-bg hover:text-text"
                    }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

    </aside>
  );
}
