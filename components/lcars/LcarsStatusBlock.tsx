import React from 'react';

interface Props {
  label: string;
  status: 'on' | 'off' | 'alert';
}

export default function LcarsStatusBlock({ label, status }: Props) {
  const color = {
    on: 'bg-lcars-green',
    off: 'bg-lcars-gray',
    alert: 'bg-lcars-red'
  }[status];

  return <div className={`${color} px-3 py-1 text-black font-bold rounded-lcars-lg`}>{label}</div>;
}
