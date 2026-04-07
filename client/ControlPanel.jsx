import React from 'react';
import { Siren, CarFront, Zap } from 'lucide-react';

export default function ControlPanel({ intersections, onTriggerEmergency, onChangeDensity }) {
  if (!intersections || intersections.length === 0) return null;

  return (
    <div className="glass-panel p-6 flex flex-col h-full w-full">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-200">
        <Zap className="text-yellow-400" size={24} />
        System Controls
      </h3>

      <div className="space-y-8 flex-1 overflow-y-auto pr-2">
        {intersections.map(intersection => (
          <div key={intersection.id} className="bg-slate-800 rounded-lg p-5 border border-slate-700/60 shadow-lg">
            <h4 className="font-semibold text-slate-300 md:text-lg mb-4">{intersection.name}</h4>
            
            <div className="space-y-4">
              {/* Emergency Override */}
              <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-md border border-slate-700">
                <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Siren size={16} className={intersection.emergency ? 'text-red-500 animate-pulse' : 'text-slate-500'} />
                  Emergency Override
                </span>
                <button 
                  onClick={() => onTriggerEmergency(intersection.id, !intersection.emergency)}
                  className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${intersection.emergency ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                >
                  {intersection.emergency ? 'DISABLE' : 'TRIGGER'}
                </button>
              </div>

              {/* Traffic Simulation Spawners */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onChangeDensity(intersection.id, 'NS', 10)}
                  className="flex items-center justify-center gap-2 py-2 bg-sky-900/40 hover:bg-sky-800/60 border border-sky-800/50 rounded-md text-sky-300 text-sm font-medium transition-colors"
                >
                  <CarFront size={16} /> +10 NS
                </button>
                <button
                  onClick={() => onChangeDensity(intersection.id, 'EW', 10)}
                  className="flex items-center justify-center gap-2 py-2 bg-fuchsia-900/40 hover:bg-fuchsia-800/60 border border-fuchsia-800/50 rounded-md text-fuchsia-300 text-sm font-medium transition-colors"
                >
                  <CarFront size={16} /> +10 EW
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
