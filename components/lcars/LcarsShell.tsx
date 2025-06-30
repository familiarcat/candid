import { ReactNode } from "react";

export default function LcarsShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-lcars-black text-white p-4 rounded-tl-3xl rounded-br-3xl">
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
}