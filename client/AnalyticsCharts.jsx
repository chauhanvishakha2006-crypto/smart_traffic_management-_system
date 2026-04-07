import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsCharts({ history, predictions }) {
  // history is an array of data points { time, totalNs, totalEw }
  
  const lineData = useMemo(() => {
    const labels = history.map(h => h.time);
    const nsData = history.map(h => h.totalNs);
    const ewData = history.map(h => h.totalEw);
    
    const predNsData = history.map(() => null);
    const predEwData = history.map(() => null);

    if (history.length > 0 && predictions) {
       labels.push('Predicted');
       nsData.push(null);
       ewData.push(null);
       
       predNsData[predNsData.length - 1] = nsData[nsData.length - 2];
       predNsData.push(predictions.ns);
       
       predEwData[predEwData.length - 1] = ewData[ewData.length - 2];
       predEwData.push(predictions.ew);
    }

    return {
      labels,
      datasets: [
        {
          label: 'NS Flow',
          data: nsData,
          borderColor: 'rgb(56, 189, 248)',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'EW Flow',
          data: ewData,
          borderColor: 'rgb(232, 121, 249)',
          backgroundColor: 'rgba(232, 121, 249, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'AI Pred NS',
          data: predNsData,
          borderColor: 'rgb(56, 189, 248)',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgb(56, 189, 248)'
        },
        {
          label: 'AI Pred EW',
          data: predEwData,
          borderColor: 'rgb(232, 121, 249)',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgb(232, 121, 249)'
        }
      ]
    };
  }, [history, predictions]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    color: '#94a3b8',
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.5)' },
        ticks: { color: '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', maxRotation: 45, minRotation: 45 }
      }
    },
    plugins: {
      legend: { labels: { color: '#cbd5e1', usePointStyle: true, boxWidth: 6 } },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(71, 85, 105, 0.5)',
        borderWidth: 1,
      }
    }
  };

  const risk = predictions?.congestionRisk || 0;
  const riskColor = risk > 75 ? 'text-red-400' : risk > 40 ? 'text-yellow-400' : 'text-emerald-400';
  const riskBg = risk > 75 ? 'bg-red-500' : risk > 40 ? 'bg-yellow-500' : 'bg-emerald-500';

  return (
    <div className="glass-panel p-6 h-full flex flex-col relative border overflow-hidden border-indigo-900/30">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      
      <div className="flex justify-between items-end mb-4 z-10">
        <h3 className="text-xl font-bold text-slate-200 flex flex-col">
          Network Flow Analysis
          <span className="text-xs font-normal text-slate-500 uppercase tracking-widest mt-1">AI Predictive Model</span>
        </h3>
        
        {/* Risk Gauge */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700/50">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Congestion Risk</span>
            <span className={`text-lg font-black ${riskColor}`}>{risk}%</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center relative overflow-hidden">
             <div className="absolute bottom-0 w-full bg-slate-700 transition-all duration-500" style={{ height: `${risk}%` }}>
                <div className={`w-full h-full ${riskBg} opacity-80 mix-blend-screen`}></div>
             </div>
             <span className="text-xs font-black z-10 text-white mix-blend-overlay">AI</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full relative min-h-[200px] z-10">
        {history.length > 0 ? (
           <Line data={lineData} options={options} />
        ) : (
           <div className="flex items-center justify-center h-full text-slate-500 italic">Initializing Neural Net...</div>
        )}
      </div>
    </div>
  );
}
