import React from 'react';
import { CrewLog, Mission } from '@/types';

interface Props {
  logs: CrewLog[] | Mission[];
}

// Type guard to check if an item is a CrewLog
function isCrewLog(log: CrewLog | Mission): log is CrewLog {
  return 'author' in log && 'message' in log && 'status' in log;
}

export default function LcarsLogFeed({ logs }: Props) {
  return (
    <ul className="space-y-2">
      {logs.map((log) => {
        if (isCrewLog(log)) {
          // This is a CrewLog - display all CrewLog properties
          return (
            <li key={log.id} className="text-lcars-peach border-l-4 border-lcars-orange pl-2">
              <div className="font-bold">
                [{log.timestamp}] {log.author} - {log.title}
              </div>
              <div className="text-sm opacity-90">
                Status: <span className={`font-semibold ${
                  log.status === 'OK' ? 'text-green-400' : 
                  log.status === 'ALERT' ? 'text-red-400' : 
                  'text-yellow-400'
                }`}>{log.status}</span>
              </div>
              <div className="mt-1">
                Message: {log.message}
              </div>
              <div className="text-sm opacity-75">
                Mission: {log.mission} | Description: {log.description}
              </div>
            </li>
          );
        } else {
          // This is a Mission - display Mission properties only
          return (
            <li key={log.id} className="text-lcars-peach border-l-4 border-lcars-blue pl-2">
              <div className="font-bold">
                [{log.timestamp}] {log.title}
              </div>
              <div className="mt-1">
                {log.description}
              </div>
            </li>
          );
        }
      })}
    </ul>
  );
}