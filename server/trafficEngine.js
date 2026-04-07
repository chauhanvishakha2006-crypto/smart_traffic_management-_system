const TrafficLog = require('../models/TrafficLog');

const LIGHT_STATES = {
  NS_GREEN: 'NS_GREEN',
  NS_YELLOW: 'NS_YELLOW',
  EW_GREEN: 'EW_GREEN',
  EW_YELLOW: 'EW_YELLOW',
};

const DEFAULT_TIMINGS = {
  GREEN: 10000,
  YELLOW: 3000,
};

class TrafficEngine {
  constructor(io) {
    this.io = io;
    this.intersections = [
      {
        id: '1',
        name: 'Main St & 1st Ave',
        status: LIGHT_STATES.NS_GREEN,
        timer: DEFAULT_TIMINGS.GREEN,
        density: { NS: 5, EW: 2 },
        emergency: false,
      },
      {
        id: '2',
        name: 'Broadway & 42nd St',
        status: LIGHT_STATES.EW_GREEN,
        timer: DEFAULT_TIMINGS.GREEN,
        density: { NS: 12, EW: 8 },
        emergency: false,
      }
    ];

    // Keep track of time
    this.tickRate = 1000; // 1 second per tick
    this.metrics = {
      startTime: Date.now(),
      totalCycles: 0,
    };
    this.history = []; // Added for predictions
    this.iotEvents = ['[System] IoT Grid online. Scanning array...'];
    this.aiDecisions = ['[System] AI Core initialized. Analyzing real-time network flow to optimize traffic patterns.'];
  }

  start() {
    this.interval = setInterval(() => {
      this.tick();
    }, this.tickRate);
    
    // Log to DB every 30 seconds
    this.dbLogInterval = setInterval(() => {
      this.logToDatabase();
    }, 30000);
  }

  tick() {
    let totalNS = 0;
    let totalEW = 0;

    this.intersections.forEach((intersection) => {
      // Logic: Emergency override
      if (intersection.emergency) {
        // AI Logic: Force all non-emergency directions (let's assume NS is emergency route for simplicity) 
        // to red by forcing NS_GREEN.
        intersection.status = LIGHT_STATES.NS_GREEN;
        // Don't decrease timer during emergency
        intersection.timer = DEFAULT_TIMINGS.GREEN; 
      } else {
        // Decrease timer
        intersection.timer -= this.tickRate;

        if (intersection.timer <= 0) {
          this.transitionLight(intersection);
        }

        // Randomly simulate traffic density changes
        this.simulateTraffic(intersection);
      }
      
      totalNS += intersection.density.NS;
      totalEW += intersection.density.EW;
    });

    this.history.push({ ns: totalNS, ew: totalEW });
    if (this.history.length > 20) {
      this.history.shift();
    }

    const predictions = this.calculatePredictions();

    // Broadcast state to clients
    this.io.emit('trafficUpdate', {
      intersections: this.intersections,
      metrics: this.metrics,
      predictions,
      iotEvents: [...this.iotEvents],
      aiDecisions: [...this.aiDecisions]
    });
  }

  calculatePredictions() {
    if (this.history.length < 2) return { ns: 0, ew: 0 };
    
    // Linear regression: y = mx + b
    const n = this.history.length;
    let sumX = 0, sumYNS = 0, sumYEW = 0, sumXYNS = 0, sumXYEW = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += i;
        sumYNS += this.history[i].ns;
        sumYEW += this.history[i].ew;
        sumXYNS += i * this.history[i].ns;
        sumXYEW += i * this.history[i].ew;
        sumX2 += i * i;
    }

    const denom = (n * sumX2 - sumX * sumX) || 1;
    const mNS = (n * sumXYNS - sumX * sumYNS) / denom;
    const bNS = (sumYNS - mNS * sumX) / n;

    const mEW = (n * sumXYEW - sumX * sumYEW) / denom;
    const bEW = (sumYEW - mEW * sumX) / n;

    // Predict 3 ticks into the future based on recent trend
    const nextIndex = n + 2; 
    const pNS = Math.max(0, mNS * nextIndex + bNS);
    const pEW = Math.max(0, mEW * nextIndex + bEW);
    
    // Calculate congestion risk (assuming max safe density is 40 per axis roughly)
    const risk = Math.min(100, Math.round(((pNS + pEW) / 60) * 100));

    return {
        ns: pNS,
        ew: pEW,
        congestionRisk: risk
    };
  }

  transitionLight(intersection) {
    switch (intersection.status) {
      case LIGHT_STATES.NS_GREEN:
        intersection.status = LIGHT_STATES.NS_YELLOW;
        intersection.timer = DEFAULT_TIMINGS.YELLOW;
        break;
      case LIGHT_STATES.NS_YELLOW:
        intersection.status = LIGHT_STATES.EW_GREEN;
        this.applyAdaptiveTiming(intersection, 'EW');
        break;
      case LIGHT_STATES.EW_GREEN:
        intersection.status = LIGHT_STATES.EW_YELLOW;
        intersection.timer = DEFAULT_TIMINGS.YELLOW;
        break;
      case LIGHT_STATES.EW_YELLOW:
        intersection.status = LIGHT_STATES.NS_GREEN;
        this.applyAdaptiveTiming(intersection, 'NS');
        this.metrics.totalCycles++;
        break;
    }
  }

  applyAdaptiveTiming(intersection, greenDirection) {
    const opposing = greenDirection === 'NS' ? 'EW' : 'NS';
    const densityGreen = intersection.density[greenDirection];
    const densityOpposing = intersection.density[opposing];
    
    // Dynamic control logic: 5 - 15 seconds
    let greenTime = 10000; 
    let reason = "balanced flow maintaining standard cycle";

    if (densityGreen > densityOpposing + 10) {
      greenTime = 15000;
      reason = `high congestion (${densityGreen} vehicles) in ${greenDirection}`;
    } else if (densityGreen < densityOpposing - 5 && densityGreen < 5) {
      greenTime = 5000;
      reason = `low traffic in ${greenDirection}, accelerating cross traffic`;
    }

    intersection.timer = greenTime;
    this.addAIDecision(`Optimization Override: Set ${greenDirection}_GREEN to ${greenTime/1000}s at ${intersection.name} due to ${reason}.`);
  }

  simulateTraffic(intersection) {
    this.simCounter = (this.simCounter || 0) + 1;
    
    // Decrease density smoothly EVERY tick for the green light to allow realistic flow
    if (intersection.status === LIGHT_STATES.NS_GREEN && intersection.density.NS > 0) {
      intersection.density.NS = Math.max(0, intersection.density.NS - 1);
    }
    if (intersection.status === LIGHT_STATES.EW_GREEN && intersection.density.EW > 0) {
      intersection.density.EW = Math.max(0, intersection.density.EW - 1);
    }

    // Only update incoming traffic stats and logs every 2 seconds
    if (this.simCounter % 2 !== 0) return;

    // Weighted random logic for vehicle arrival (simulate traffic peaks/valleys)
    const nsChange = Math.floor(Math.random() * 5) - 0; // 0 to 4 arrivals per 2 sec
    const ewChange = Math.floor(Math.random() * 4) - 0; // 0 to 3

    if (intersection.status !== LIGHT_STATES.NS_GREEN) {
      intersection.density.NS = Math.max(0, Math.min(50, intersection.density.NS + nsChange));
    }
    if (intersection.status !== LIGHT_STATES.EW_GREEN) {
      intersection.density.EW = Math.max(0, Math.min(50, intersection.density.EW + ewChange));
    }
    
    // IoT Event logging and Emergency Handling
    if (!intersection.emergency && Math.random() < 0.02) {
      intersection.emergency = true;
      intersection.status = LIGHT_STATES.NS_GREEN; // Immediate override
      intersection.timer = 15000;
      this.addIoTEvent(`[Radar] Emergency vehicle approaching ${intersection.name}. Overriding signals.`);
    } else if (intersection.emergency && Math.random() < 0.1) {
      intersection.emergency = false;
      this.addIoTEvent(`[Radar] Emergency cleared at ${intersection.name}. Returning control to AI.`);
    }

    // Regular live telemetry updates
    const highestDensity = Math.max(intersection.density.NS, intersection.density.EW);
    const highestLane = highestDensity === intersection.density.NS ? 'NS' : 'EW';
    let densityLvl = highestDensity > 20 ? 'HIGH' : highestDensity > 10 ? 'MEDIUM' : 'LOW';
    
    if (Math.random() < 0.3) {
      this.addIoTEvent(`Sensor active: ${highestDensity} vehicles detected in ${highestLane} lane at ${intersection.name} (${densityLvl} density).`);
    } else if (Math.random() < 0.2 && highestDensity < 5) {
      this.addIoTEvent(`Camera node nominal: Roads are clearing at ${intersection.name}.`);
    }
  }

  addIoTEvent(msg) {
    const timeInfo = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.iotEvents.unshift(`[${timeInfo}] ${msg}`);
    if (this.iotEvents.length > 5) this.iotEvents.pop();
  }

  addAIDecision(msg) {
    const timeInfo = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.aiDecisions.unshift(`[${timeInfo}] ${msg}`);
    if (this.aiDecisions.length > 5) this.aiDecisions.pop();
  }

  setEmergency(id, state) {
    const ints = this.intersections.find(i => i.id === id);
    if (ints) {
      ints.emergency = state;
      // Immediately notify
      this.io.emit('trafficUpdate', { intersections: this.intersections, metrics: this.metrics });
    }
  }

  setDensity(id, direction, val) {
     const ints = this.intersections.find(i => i.id === id);
     if (ints) {
         ints.density[direction] = Math.max(0, Math.min(100, ints.density[direction] + val));
         this.io.emit('trafficUpdate', { intersections: this.intersections, metrics: this.metrics });
     }
  }

  async logToDatabase() {
    try {
      const log = new TrafficLog({
        metrics: {
          averageDensity: this.intersections.reduce((acc, curr) => acc + curr.density.NS + curr.density.EW, 0) / (this.intersections.length * 2),
          totalVehicles: this.intersections.reduce((acc, curr) => acc + curr.density.NS + curr.density.EW, 0),
          activeEmergencies: this.intersections.filter(i => i.emergency).length
        },
        intersections: this.intersections.map(i => ({
          id: i.id,
          status: i.status,
          density: i.density,
          emergency: i.emergency
        }))
      });
      await log.save();
      console.log('Traffic metrics logged to database.');
    } catch (err) {
      console.error('Error logging to database:', err.message);
    }
  }
}

module.exports = TrafficEngine;
