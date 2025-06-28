#!/bin/bash
set -e

echo "🖖 Injecting Phase Y1: LCARS Layout & Views..."

# Create app/layout.tsx
mkdir -p ./app
cat <<EOF > ./app/layout.tsx
import '../styles/globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-lcars-black text-lcars-white font-lcars">
        {children}
      </body>
    </html>
  );
}
EOF
echo "✅ Created app/layout.tsx"

# Create /app/dashboard/page.tsx
mkdir -p ./app/dashboard
cat <<EOF > ./app/dashboard/page.tsx
'use client';
import DashboardCard from '@/components/DashboardCards';
import React from 'react';

export default function DashboardPage() {
  return (
    <main className="p-md space-y-md">
      <h1 className="text-4xl font-bold text-lcars-peach mb-md">LCARS Observation Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
        <DashboardCard title="Connections" value={42} description="Total networked users" />
        <DashboardCard title="Missions" value={5} description="Active threads" />
        <DashboardCard title="Pending" value={13} description="Unresolved interactions" />
      </div>
    </main>
  );
}
EOF
echo "✅ Created app/dashboard/page.tsx"

# Optional: create placeholder for other pages
mkdir -p ./app/missions
echo -e "export default function Missions() {
  return <div className='p-md text-lcars-yellow'>Missions Page Placeholder</div>;
}" > ./app/missions/page.tsx
mkdir -p ./app/tasks
echo -e "export default function Tasks() {
  return <div className='p-md text-lcars-cyan'>Tasks Page Placeholder</div>;
}" > ./app/tasks/page.tsx
echo "✅ Created placeholder pages for /missions and /tasks"

echo "✅ Phase Y1 Injection Complete – LCARS layout and views scaffolded."
