import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function LcarsPanelSection({ children }: Props) {
  return <section className="bg-lcars-black text-lcars-peach p-2">{children}</section>;
}
