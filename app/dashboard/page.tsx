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
