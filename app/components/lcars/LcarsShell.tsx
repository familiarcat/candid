import React, { ReactNode } from 'react';

type LcarsShellProps = {
  children: ReactNode;
};

const LcarsShell: React.FC<LcarsShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-lcars-black text-lcars-white font-lcars">
      <header className="bg-lcars-peach p-md text-black text-xl font-bold">
        LCARS Observation Lounge
      </header>
      <main className="p-md">{children}</main>
      <footer className="bg-lcars-violet p-sm text-center text-sm mt-xl">
        © 2025 United Federation of Engineers
      </footer>
    </div>
  );
};

export default LcarsShell;
