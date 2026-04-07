import React from 'react';

const TrafficLight = ({ color, active }) => {
  const bgColors = {
    red: 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]',
    yellow: 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]',
    green: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
  };

  return (
    <div className={`w-3 h-3 rounded-full border border-slate-900 transition-all duration-300 ${active ? bgColors[color] : 'bg-slate-800 opacity-40'}`} />
  );
};

export default function IntersectionVisualizer({ data }) {
  const { id, name, status, density, emergency, timer } = data;
  
  const nsGreen = status === 'NS_GREEN';
  const nsYellow = status === 'NS_YELLOW';
  const ewGreen = status === 'EW_GREEN';
  const ewYellow = status === 'EW_YELLOW';

  const nsRed = !nsGreen && !nsYellow;
  const ewRed = !ewGreen && !ewYellow;
  
  const countdown = Math.ceil(timer / 1000);
  
  const getDensityLvl = (val) => val > 20 ? 'HIGH' : val > 10 ? 'MED' : 'LOW';
  const getDensityColor = (val) => val > 20 ? 'text-red-400' : val > 10 ? 'text-yellow-400' : 'text-emerald-400';

  return (
    <div className={`glass-panel p-6 flex flex-col items-center relative border overflow-hidden transition-all duration-500 ${emergency ? 'border-red-900/50 shadow-[inset_0_0_50px_rgba(220,38,38,0.1)]' : 'border-slate-800'}`}>
      
      {emergency && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 animate-pulse" />
      )}
      
      <h3 className="text-xl font-bold mb-6 text-slate-200 z-10">{name}</h3>

      {/* Intersection Map Area */}
      <div className="relative w-64 h-64 bg-slate-900 rounded-lg border border-slate-700/50 flex items-center justify-center shadow-[inset_0_5px_30px_rgba(0,0,0,0.5)]">
        
        {/* Background Grid for Tech Feel */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

        {/* NS Road Layer */}
        <div className="absolute w-20 h-full bg-slate-800/80 border-l border-r border-slate-600/50">
           {/* Center dashed line */}
           <div className="absolute left-[50%] h-full w-0.5 bg-yellow-500/30" style={{ backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(234, 179, 8, 0.4) 50%)', backgroundSize: '100% 24px' }}></div>
        </div>
        
        {/* EW Road Layer */}
        <div className="absolute h-20 w-full bg-slate-800/80 border-t border-b border-slate-600/50">
           {/* Center dashed line */}
           <div className="absolute top-[50%] w-full h-0.5 bg-yellow-500/30" style={{ backgroundImage: 'linear-gradient(to right, transparent 50%, rgba(234, 179, 8, 0.4) 50%)', backgroundSize: '24px 100%' }}></div>
        </div>

        {/* Center Intersection Block With Countdown */}
        <div className="absolute w-20 h-20 bg-slate-800 z-30 border border-slate-700/50 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center flex-col relative overflow-hidden">
            {emergency && (
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center animate-ping absolute">
                  <div className="w-4 h-4 rounded-full bg-red-500/40"></div>
              </div>
            )}
            <span className="text-[10px] uppercase font-bold text-slate-500 z-10 leading-none">Timer</span>
            <span className="text-2xl font-black text-white z-10">{countdown}s</span>
        </div>

        {/* Traffic Lights */}
        <div className="absolute top-[2px] left-[50%] -translate-x-12 bg-black/80 px-1 py-1.5 rounded flex flex-col gap-1 z-20 border border-slate-700">
          <TrafficLight color="red" active={nsRed} />
          <TrafficLight color="yellow" active={nsYellow} />
          <TrafficLight color="green" active={nsGreen} />
        </div>
        <div className="absolute bottom-[2px] left-[50%] -translate-x-12 bg-black/80 px-1 py-1.5 rounded flex flex-col gap-1 z-20 border border-slate-700">
          <TrafficLight color="red" active={nsRed} />
          <TrafficLight color="yellow" active={nsYellow} />
          <TrafficLight color="green" active={nsGreen} />
        </div>
        <div className="absolute right-[2px] top-[50%] -translate-y-12 bg-black/80 px-1.5 py-1 rounded flex gap-1 z-20 border border-slate-700">
          <TrafficLight color="red" active={ewRed} />
          <TrafficLight color="yellow" active={ewYellow} />
          <TrafficLight color="green" active={ewGreen} />
        </div>
        <div className="absolute left-[2px] top-[50%] -translate-y-12 bg-black/80 px-1.5 py-1 rounded flex gap-1 z-20 border border-slate-700">
          <TrafficLight color="red" active={ewRed} />
          <TrafficLight color="yellow" active={ewYellow} />
          <TrafficLight color="green" active={ewGreen} />
        </div>

        {/* Animated Simulated Vehicles */}
        {/* North-South Moving Cars */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {Array.from({ length: Math.min(6, Math.ceil(density.NS / 3)) }).map((_, i) => (
             <div 
               key={`ns-${i}`} 
               className="absolute w-3 h-5 bg-sky-400 rounded-sm shadow-[0_0_10px_rgba(56,189,248,0.8)] animate-drive-ns"
               style={{ 
                 left: `calc(50% - 10px + ${i % 2 === 0 ? 0 : 8}px)`, 
                 animationDelay: `${i * 0.4}s`,
                 animationPlayState: nsGreen ? 'running' : 'paused'
               }} 
             />
          ))}
          {/* East-West Moving Cars */}
          {Array.from({ length: Math.min(6, Math.ceil(density.EW / 3)) }).map((_, i) => (
             <div 
               key={`ew-${i}`} 
               className="absolute w-5 h-3 bg-fuchsia-400 rounded-sm shadow-[0_0_10px_rgba(232,121,249,0.8)] animate-drive-ew"
               style={{ 
                 top: `calc(50% - 10px + ${i % 2 === 0 ? 0 : 8}px)`, 
                 animationDelay: `${i * 0.4}s`,
                 animationPlayState: ewGreen ? 'running' : 'paused'
               }} 
             />
          ))}
        </div>
      </div>
      
      {/* High-Tech Dashboard Summaries */}
      <div className="w-full mt-6 grid grid-cols-2 gap-4 text-center z-10">
        <div className={`bg-slate-900 p-3 rounded border shadow-inner relative overflow-hidden transition-colors ${nsGreen ? 'border-sky-500/50 bg-sky-900/10' : 'border-slate-800'}`}>
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">NS Queue</p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border border-slate-700/50 bg-slate-950 ${getDensityColor(density.NS)}`}>{getDensityLvl(density.NS)}</span>
          </div>
          <p className="text-2xl font-black text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.4)] text-left">{density.NS}</p>
        </div>
        <div className={`bg-slate-900 p-3 rounded border shadow-inner relative overflow-hidden transition-colors ${ewGreen ? 'border-fuchsia-500/50 bg-fuchsia-900/10' : 'border-slate-800'}`}>
           <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">EW Queue</p>
             <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border border-slate-700/50 bg-slate-950 ${getDensityColor(density.EW)}`}>{getDensityLvl(density.EW)}</span>
          </div>
          <p className="text-2xl font-black text-fuchsia-400 drop-shadow-[0_0_10px_rgba(232,121,249,0.4)] text-left">{density.EW}</p>
        </div>
      </div>
    </div>
  );
}
