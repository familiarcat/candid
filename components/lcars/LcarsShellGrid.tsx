import React, { ReactNode } from 'react';

export default function LcarsShellGrid({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-lcars-black text-lcars-peach font-lcars grid grid-cols-[240px_1fr]">
      {children}
    </div>
  );
}
