const mongoose = require('mongoose');

const trafficLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  metrics: {
    averageDensity: Number,
    totalVehicles: Number,
    activeEmergencies: Number
  },
  intersections: [{
    id: String,
    status: String,
    density: {
      NS: Number,
      EW: Number
    },
    emergency: Boolean
  }]
});

module.exports = mongoose.model('TrafficLog', trafficLogSchema);
