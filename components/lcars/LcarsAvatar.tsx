import React from 'react';
import { Avatar } from '@/types';

interface Props {
  data: Avatar;
}

export default function LcarsAvatar({ data }: Props) {
  return (
    <div className="flex items-center space-x-3 bg-lcars-black text-white p-3 rounded-lcars-lg border border-lcars-orange">
      <div className="w-10 h-10 bg-lcars-blue rounded-full text-center leading-10 font-bold">{data.name[0]}</div>
      <div>
        <div className="font-bold text-lcars-peach">{data.name}</div>
        <div className="text-sm text-lcars-gray">{data.rank} • {data.species}</div>
      </div>
    </div>
  );
}
