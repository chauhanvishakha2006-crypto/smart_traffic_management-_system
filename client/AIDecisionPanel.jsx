import React from 'react';
import { Brain, Cpu, Network } from 'lucide-react';

export default function AIDecisionPanel({ iotEvents = [], aiDecisions = [] }) {
  return (
    <div className="glass-panel p-6 flex flex-col h-full w-full border border-indigo-900/50 shadow-[0_0_20px_rgba(79,70,229,0.15)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-300">
          <Brain className="text-indigo-400" size={24} />
          AI Core Intelligence
        </h3>
        <span className="flex items-center gap-2 text-xs font-bold text-sky-400 bg-sky-900/30 px-2 py-1 rounded-full border border-sky-800">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
          OPTIMIZING
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 flex-1 overflow-hidden">
        {/* AI Logical Decisions */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-indigo-900/30 flex flex-col overflow-hidden">
          <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Cpu size={16} /> Decision Log
          </h4>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {aiDecisions.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Waiting for AI optimization events...</p>
            ) : (
              aiDecisions.map((decision, idx) => (
                <div key={idx} className="bg-indigo-950/40 p-2.5 rounded border-l-2 border-indigo-500 text-sm text-slate-300 shadow-sm animate-fade-in">
                  {decision}
                </div>
              ))
            )}
          </div>
        </div>

        {/* IoT Raw Events */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-cyan-900/30 flex flex-col overflow-hidden">
          <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Network size={16} /> IoT Sensor Array
          </h4>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {iotEvents.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Listening to array...</p>
            ) : (
              iotEvents.map((evt, idx) => {
                const isEmergency = evt.includes('Emergency');
                return (
                  <div key={idx} className={`p-2.5 rounded text-xs font-mono border-l-2 shadow-sm animate-fade-in ${isEmergency ? 'bg-red-950/40 border-red-500 text-red-200' : 'bg-cyan-950/20 border-cyan-500 text-cyan-200'}`}>
                    {evt}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
