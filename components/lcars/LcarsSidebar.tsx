import React from 'react';
import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Missions', href: '/missions' },
  { label: 'Logs', href: '/logs' },
];

export default function LcarsSidebar() {
  return (
    <aside className="bg-lcars-blue text-lcars-black h-full p-4 flex flex-col gap-4">
      {navItems.map(({ label, href }) => (
        <Link key={href} href={href} className="bg-lcars-peach px-3 py-2 rounded hover:bg-lcars-orange">
          {label}
        </Link>
      ))}
    </aside>
  );
}
