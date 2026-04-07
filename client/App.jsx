import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import IntersectionVisualizer from './components/IntersectionVisualizer';
import ControlPanel from './components/ControlPanel';
import AnalyticsCharts from './components/AnalyticsCharts';
import AIDecisionPanel from './components/AIDecisionPanel';
import { ShieldAlert, Activity } from 'lucide-react';

const socket = io('http://localhost:4000');

function App() {
  const [intersections, setIntersections] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [history, setHistory] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [iotEvents, setIotEvents] = useState([]);
  const [aiDecisions, setAiDecisions] = useState([]);

  useEffect(() => {
    socket.on('trafficUpdate', (data) => {
      setIntersections(data.intersections);
      setMetrics(data.metrics);
      if (data.predictions) {
        setPredictions(data.predictions);
      }
      if (data.iotEvents) setIotEvents(data.iotEvents);
      if (data.aiDecisions) setAiDecisions(data.aiDecisions);

      // Keep last 20 data points for history
      setHistory(prev => {
        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute: 'numeric', second:'numeric' });
        
        let totalNs = 0;
        let totalEw = 0;
        
        data.intersections.forEach(i => {
           totalNs += i.density.NS;
           totalEw += i.density.EW;
        });

        const newPoint = { time: now, totalNs, totalEw };
        const newHistory = [...prev, newPoint];
        if (newHistory.length > 20) {
          newHistory.shift();
        }
        return newHistory;
      });
    });

    return () => {
      socket.off('trafficUpdate');
    };
  }, []);

  const handleTriggerEmergency = (id, state) => {
    socket.emit('triggerEmergency', { id, state });
  };

  const handleChangeDensity = (id, direction, amount) => {
    socket.emit('changeDensity', { id, direction, amount });
  };

  const activeEmergencies = intersections.filter(i => i.emergency).length;
  const isCongested = intersections.some(i => i.density.NS > 30 || i.density.EW > 30);
  
  let systemStatus = "Normal";
  let statusColor = "text-emerald-400";
  if (activeEmergencies > 0) {
    systemStatus = "Emergency Mode Active";
    statusColor = "text-red-500 animate-pulse";
  } else if (isCongested) {
    systemStatus = "Congested";
    statusColor = "text-yellow-400";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-6 lg:p-8 flex flex-col">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row items-center justify-between glass-panel p-4 px-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Activity className="text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">Nexus Smart City</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Traffic Control Systems</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-sm text-slate-400 font-medium">System Status</span>
            <span className={`text-lg font-bold flex items-center gap-2 ${statusColor}`}>
              {activeEmergencies > 0 && <ShieldAlert size={18} />}
              {systemStatus}
            </span>
          </div>
          <div className="h-10 w-px bg-slate-700 hidden md:block"></div>
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm text-slate-400 font-medium">Total Cycles</span>
            <span className="text-lg font-bold text-slate-200">{metrics.totalCycles || 0}</span>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Intersections Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {intersections.length === 0 ? (
               <div className="col-span-2 text-center text-slate-500 py-20 bg-slate-900/50 rounded-xl border border-slate-800">
                  Connecting to Traffic Engine...
               </div>
            ) : (
              intersections.map(intersection => (
                <IntersectionVisualizer key={intersection.id} data={intersection} />
              ))
            )}
          </div>
          
          {/* Charts Area */}
          <div className="flex-1 min-h-[300px]">
            <AnalyticsCharts history={history} predictions={predictions} />
          </div>
        </div>

        {/* Right Column: Controls & AI */}
        <div className="lg:col-span-4 h-full flex flex-col gap-6">
          <div className="flex-1 min-h-[300px]">
            <AIDecisionPanel iotEvents={iotEvents} aiDecisions={aiDecisions} />
          </div>
          <div className="flex-1 min-h-[300px]">
            <ControlPanel 
              intersections={intersections} 
              onTriggerEmergency={handleTriggerEmergency}
              onChangeDensity={handleChangeDensity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
