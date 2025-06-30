import React from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  label: string;
  path: string;
}

export default function LcarsNavButton({ label, path }: Props) {
  const router = useRouter();
  return (
    <button onClick={() => router.push(path)} className="bg-lcars-orange text-black px-4 py-2 rounded-lcars-full w-full text-left">
      {label}
    </button>
  );
}
