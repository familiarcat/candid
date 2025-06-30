import React from 'react';

export default function LcarsButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      className="bg-lcars-orange text-black px-4 py-2 rounded-lcars-br hover:bg-lcars-yellow transition-colors"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
