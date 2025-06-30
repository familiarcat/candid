import React from 'react';

interface Props {
  label: string;
}

export default function LcarsPanelHeader({ label }: Props) {
  return <div className="bg-lcars-orange text-black px-3 py-1 font-semibold">{label}</div>;
}
