"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type PremisesNavProps = {
  premisesId: string;
};

const links = [
  { href: (id: string) => `/premises/${id}/profile`, label: "Profile" },
  { href: (id: string) => `/premises/${id}/audit`, label: "Audits" },
  { href: (id: string) => `/premises/${id}/actions`, label: "Actions" },
] as const;

export function PremisesNav({ premisesId }: PremisesNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
      {links.map((link) => {
        const href = link.href(premisesId);
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-emerald-700 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
