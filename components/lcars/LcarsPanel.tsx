import React, { ReactNode } from 'react';

export default function LcarsPanel({ children }: { children: ReactNode }) {
  return (
    <div className="bg-lcars-panel rounded-lg p-4 m-4 shadow-md border border-lcars-peach">
      {children}
    </div>
  );
}
