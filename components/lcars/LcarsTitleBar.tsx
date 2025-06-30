import React from 'react';

interface Props {
  title: string;
}

export default function LcarsTitleBar({ title }: Props) {
  return <div className="bg-lcars-lavender text-black text-xl px-4 py-2 font-bold">{title}</div>;
}
