import React from 'react';

interface Props {
  value: number;
}

export default function LcarsProgressBar({ value }: Props) {
  return (
    <div className="w-full bg-lcars-gray h-3 rounded-full overflow-hidden">
      <div className="bg-lcars-peach h-3 transition-all duration-300" style={{ width: `${value}%` }} />
    </div>
  );
}
