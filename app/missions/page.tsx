import React from 'react';
import LcarsShell from '@/components/lcars/LcarsShell';
import LcarsSidebar from '@/components/lcars/LcarsSidebar';
import LcarsContent from '@/components/lcars/LcarsContent';
import LcarsTitleBar from '@/components/lcars/LcarsTitleBar';
import LcarsPanel from '@/components/lcars/LcarsPanel';
import useMockData from '@/lib/useMockData';
import LcarsLogFeed from '@/components/lcars/LcarsLogFeed';

export default function MissionsPage() {
  const { missions } = useMockData();
  return (
    <LcarsShell>
      <LcarsSidebar />
      <LcarsContent>
        <LcarsTitleBar title="Missions" />
        <LcarsPanel>
          <LcarsLogFeed logs={missions} />
        </LcarsPanel>
      </LcarsContent>
    </LcarsShell>
  );
}
