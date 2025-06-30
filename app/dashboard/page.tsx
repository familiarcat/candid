// app/dashboard/page.tsx
"use client";
import LcarsShell from "@/components/lcars/LcarsShell";
import LcarsShellGrid from "@/components/lcars/LcarsShellGrid";
import LcarsPanel from "@/components/lcars/LcarsPanel";
import LcarsButton from "@/components/lcars/LcarsButton";

export default function DashboardPage() {
  return (
    <LcarsShell>
      <LcarsShellGrid>
        <LcarsPanel>
          <h1 className="text-4xl font-bold mb-4">Welcome to the LCARS Dashboard</h1>
          <LcarsButton label="Begin Mission" onClick={() => alert("Mission initiated")} />
        </LcarsPanel>
      </LcarsShellGrid>
    </LcarsShell>
  );
}
