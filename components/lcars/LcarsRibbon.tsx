import React from "react";

export default function LcarsRibbon({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-tl-[5rem] rounded-bl-[5rem] rounded-tr-[2rem] rounded-br-[2rem]">
    <div className="rounded-tl-[5rem] rounded-bl-[5rem] rounded-tr-[2rem] rounded-br-[2rem]">
    <div className="bg-lcars-peach h-[50px] rounded-full px-4 flex items-center">
      {children}
    </div>
  
    </div>
    </div>)
}
