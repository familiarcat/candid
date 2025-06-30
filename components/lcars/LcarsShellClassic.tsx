
import React from "react";

export default function LcarsShellClassic({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-tl-[5rem] rounded-bl-[5rem] rounded-tr-[2rem] rounded-br-[2rem]">
    <div className="rounded-tl-[5rem] rounded-bl-[5rem] rounded-tr-[2rem] rounded-br-[2rem]">
    <div className="min-h-screen bg-lcars-black text-white font-lcars">
      {/* Top Lavender Header Ribbon */}
      <div className="bg-lcars-lavender h-12 w-full rounded-b-[100px]" />

      {/* Main Body Grid */}
      <div className="flex">
        {/* Left Sidebar Ribbon */}
        <div className="w-1/5 bg-lcars-red rounded-r-[100px] p-4 space-y-4">
          <button className="w-full bg-lcars-orange text-black py-2 rounded-l-full">Dashboard</button>
          <button className="w-full bg-lcars-blue text-white py-2 rounded-l-full">Missions</button>
          <button className="w-full bg-lcars-red text-white py-2 rounded-l-full">Logs</button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-lcars-black px-4 py-6">
          {children}
        </div>
      </div>
    </div>
  ;
    </div>
    </div>)
}
