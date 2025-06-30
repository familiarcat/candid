import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function LcarsContent({ children }: Props) {
  return (
    <main className="bg-black text-white p-4 rounded-lcars-lg overflow-y-auto">
      {children}
    </main>
  );
}
