import React from 'react';

interface Props {
  status: 'ok' | 'alert' | 'error';
}

export default function LcarsIndicator({ status }: Props) {
  const color = {
    ok: 'bg-lcars-green',
    alert: 'bg-lcars-orange',
    error: 'bg-lcars-red'
  }[status];

  return <span className={`${color} w-3 h-3 inline-block rounded-full`} />;
}
