export const INITIAL_BUSES = [
  {
    id: "ASTRA-101",
    route_name: "Central Corridor (PNBS - Benz Circle)",
    plate_number: "AP 16 Z 4091",
    status: "IN_SERVICE",
    lat: 16.5074,
    lng: 80.6482,
    heading: 120,
    speed: 32,
    occupancy: 78,
    battery_or_fuel: 85,
    ai_status: "ACTIVE",
    last_event: "Front optical camera streaming • YOLOv11n",
    last_updated: new Date().toISOString()
  },
  {
    id: "ASTRA-102",
    route_name: "Prakasam Riverfront (Station - Tadepalli)",
    plate_number: "AP 16 Z 5512",
    status: "IN_SERVICE",
    lat: 16.5060,
    lng: 80.6050,
    heading: 210,
    speed: 28,
    occupancy: 62,
    battery_or_fuel: 92,
    ai_status: "ACTIVE",
    last_event: "Waterlogging scan active • Prakasam Barrage",
    last_updated: new Date().toISOString()
  },
  {
    id: "ASTRA-103",
    route_name: "MG Road City Loop",
    plate_number: "AP 37 AB 4821",
    status: "IN_SERVICE",
    lat: 16.5015,
    lng: 80.6590,
    heading: 45,
    speed: 24,
    occupancy: 84,
    battery_or_fuel: 76,
    ai_status: "ACTIVE",
    last_event: "ANPR Windshield Stream Sync • 30 FPS",
    last_updated: new Date().toISOString()
  },
  {
    id: "ASTRA-104",
    route_name: "Gunadala Heritage Line",
    plate_number: "AP 16 TX 7780",
    status: "IN_SERVICE",
    lat: 16.5245,
    lng: 80.6475,
    heading: 80,
    speed: 35,
    occupancy: 54,
    battery_or_fuel: 88,
    ai_status: "ACTIVE",
    last_event: "Signage & obstacle scan active",
    last_updated: new Date().toISOString()
  },
  {
    id: "ASTRA-105",
    route_name: "Amaravati NH-16 Link",
    plate_number: "AP 16 Y 9923",
    status: "IN_SERVICE",
    lat: 16.4880,
    lng: 80.6600,
    heading: 160,
    speed: 42,
    occupancy: 68,
    battery_or_fuel: 81,
    ai_status: "ACTIVE",
    last_event: "Pavement condition telemetry nominal",
    last_updated: new Date().toISOString()
  }
];

export const INITIAL_DEFECTS = [
  {
    id: "DEF-P-101",
    type: "pothole",
    severity: "CRITICAL",
    priority: "HIGH",
    confidence: 0.96,
    lat: 16.5020,
    lng: 80.6580,
    address: "MG Road near DV Manor",
    ward: "Ward 12 - Central Zone",
    recurrence_count: 4,
    detected_by: JSON.stringify(["ASTRA-101", "ASTRA-103", "ASTRA-105"]),
    status: "OPEN"
  },
  {
    id: "DEF-P-104",
    type: "pothole",
    severity: "HIGH",
    priority: "HIGH",
    confidence: 0.94,
    lat: 16.5074,
    lng: 80.6482,
    address: "Sub-Collector Office Jn",
    ward: "Ward 14 - East Zone",
    recurrence_count: 3,
    detected_by: JSON.stringify(["ASTRA-101", "ASTRA-103"]),
    status: "OPEN"
  },
  {
    id: "DEF-P-108",
    type: "pothole",
    severity: "MEDIUM",
    priority: "MEDIUM",
    confidence: 0.91,
    lat: 16.5145,
    lng: 80.6275,
    address: "Governorpet 5-Roads Junction",
    ward: "Ward 08 - North Zone",
    recurrence_count: 2,
    detected_by: JSON.stringify(["ASTRA-101", "ASTRA-104"]),
    status: "OPEN"
  },
  {
    id: "DEF-P-112",
    type: "pothole",
    severity: "LOW",
    priority: "LOW",
    confidence: 0.88,
    lat: 16.4950,
    lng: 80.6720,
    address: "Patamata High School Road",
    ward: "Ward 19 - East Zone",
    recurrence_count: 1,
    detected_by: JSON.stringify(["ASTRA-101"]),
    status: "OPEN"
  },
  {
    id: "DEF-W-201",
    type: "waterlogging",
    severity: "CRITICAL",
    priority: "HIGH",
    confidence: 0.97,
    lat: 16.5060,
    lng: 80.6050,
    address: "Prakasam Barrage North Ramp",
    ward: "Ward 03 - Riverfront Zone",
    recurrence_count: 4,
    detected_by: JSON.stringify(["ASTRA-102", "ASTRA-103"]),
    status: "OPEN"
  },
  {
    id: "DEF-W-204",
    type: "waterlogging",
    severity: "HIGH",
    priority: "MEDIUM",
    confidence: 0.92,
    lat: 16.4890,
    lng: 80.6110,
    address: "Tadepalli Underpass Submerged",
    ward: "Ward 02 - South Zone",
    recurrence_count: 2,
    detected_by: JSON.stringify(["ASTRA-102"]),
    status: "OPEN"
  },
  {
    id: "DEF-S-301",
    type: "missing_signage",
    severity: "LOW",
    priority: "LOW",
    confidence: 0.89,
    lat: 16.5245,
    lng: 80.6475,
    address: "Machavaram Down School Zone",
    ward: "Ward 22 - North Zone",
    recurrence_count: 1,
    detected_by: JSON.stringify(["ASTRA-104"]),
    status: "OPEN"
  },
  {
    id: "DEF-S-303",
    type: "missing_signage",
    severity: "MEDIUM",
    priority: "MEDIUM",
    confidence: 0.93,
    lat: 16.4750,
    lng: 80.6550,
    address: "Kanuru Center Speed Limit Post",
    ward: "Ward 28 - Outer Zone",
    recurrence_count: 2,
    detected_by: JSON.stringify(["ASTRA-105"]),
    status: "OPEN"
  }
];

export const INITIAL_ALERTS = [
  {
    id: "INC-2026-081",
    type: "HIT_AND_RUN",
    title: "🚨 Hit & Run with Two-Wheeler",
    license_plate: "AP 37 AB 4821",
    confidence: 0.942,
    bus_id: "ASTRA-103",
    timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
    lat: 16.4998,
    lng: 80.6625,
    location_name: "Benz Circle Flyover Underpass",
    status: "OPEN",
    notes: "Red hatchback collided with scooter and fled towards Ring Road."
  },
  {
    id: "INC-2026-080",
    type: "ILLEGAL_PARKING",
    title: "⛔ BRTS Dedicated Bus Lane Blocked",
    license_plate: "AP 16 TX 7780",
    confidence: 0.915,
    bus_id: "ASTRA-101",
    timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    lat: 16.5145,
    lng: 80.6275,
    location_name: "Governorpet Commercial Corridor",
    status: "REVIEWED",
    notes: "Commercial loading truck parked inside rapid bus lane during peak hour."
  },
  {
    id: "INC-2026-079",
    type: "WATERLOGGED_ROAD",
    title: "🌊 Flash Flood Inundation Alert",
    license_plate: "N/A",
    confidence: 0.968,
    bus_id: "ASTRA-102",
    timestamp: new Date(Date.now() - 68 * 60000).toISOString(),
    lat: 16.5060,
    lng: 80.6050,
    location_name: "Prakasam Barrage Approach Road",
    status: "DISPATCHED",
    notes: "Water depth measured > 22cm by optical edge gauge. Traffic diverted."
  },
  {
    id: "INC-2026-078",
    type: "RECKLESS_DRIVING",
    title: "⚠️ High-Speed Erratic Lane Weaving",
    license_plate: "TS 09 UB 1042",
    confidence: 0.934,
    bus_id: "ASTRA-104",
    timestamp: new Date(Date.now() - 95 * 60000).toISOString(),
    lat: 16.5220,
    lng: 80.6370,
    location_name: "Eluru Road Chuttugunta Circle",
    status: "RESOLVED",
    notes: "Traffic police interception unit dispatched; e-challan served."
  }
];

export const INITIAL_KPIS = {
  active_buses: 5,
  total_buses: 5,
  active_buses_status: "All systems operational",
  total_defects: 8,
  high_priority_defects: 3,
  active_incidents: 4,
  total_incidents: 4,
  avg_traffic_density: 62,
  traffic_status: "Moderate Flow (Corridor Avg)",
  routes_monitored: 5,
  total_corridor_km: 142.8,
  ai_events_today: 1845,
  camera_uptime_percent: 99.4
};

export const INITIAL_ANALYTICS = {
  defectsByType: [
    { name: "Potholes", type: "pothole", count: 4, color: "#f97316" },
    { name: "Waterlogging", type: "waterlogging", count: 2, color: "#0284c7" },
    { name: "Missing Signage", type: "missing_signage", count: 2, color: "#eab308" }
  ],
  recurrenceBreakdown: [
    { priority: "Low (1 Detection)", level: "LOW", count: 2, color: "#10b981" },
    { priority: "Medium (2 Detections)", level: "MEDIUM", count: 3, color: "#f59e0b" },
    { priority: "High (3+ Detections)", level: "HIGH", count: 3, color: "#ef4444" }
  ],
  hourlyIncidents: [
    { time: "06:00", incidents: 1, defects: 2, traffic: 28 },
    { time: "08:00", incidents: 3, defects: 4, traffic: 74 },
    { time: "10:00", incidents: 5, defects: 6, traffic: 88 },
    { time: "12:00", incidents: 2, defects: 3, traffic: 65 },
    { time: "14:00", incidents: 2, defects: 2, traffic: 54 },
    { time: "16:00", incidents: 4, defects: 5, traffic: 82 },
    { time: "18:00", incidents: 7, defects: 8, traffic: 96 },
    { time: "20:00", incidents: 3, defects: 3, traffic: 68 }
  ],
  fleetMetrics: [
    { bus_id: "ASTRA-101", route: "Central Corridor", km_monitored: 38.4, ai_detections: 482, health: "98%" },
    { bus_id: "ASTRA-102", route: "Riverfront Line", km_monitored: 29.1, ai_detections: 367, health: "95%" },
    { bus_id: "ASTRA-103", route: "MG Road City Loop", km_monitored: 34.6, ai_detections: 512, health: "99%" },
    { bus_id: "ASTRA-104", route: "Gunadala Line", km_monitored: 22.8, ai_detections: 294, health: "94%" },
    { bus_id: "ASTRA-105", route: "NH-16 Link", km_monitored: 41.2, ai_detections: 410, health: "97%" }
  ],
  roadQualityIndex: [
    { zone: "Ward 12 (Central)", score: 64, status: "Needs Maintenance", color: "#f59e0b" },
    { zone: "Ward 03 (Riverfront)", score: 52, status: "Vulnerable (Waterlogging)", color: "#ef4444" },
    { zone: "Ward 14 (East)", score: 71, status: "Fair", color: "#3b82f6" },
    { zone: "Ward 22 (North)", score: 83, status: "Good", color: "#10b981" },
    { zone: "Ward 28 (Outer NH)", score: 88, status: "Excellent", color: "#10b981" }
  ],
  congestionCorridors: [
    { corridor: "MG Road (DV Manor - Benz Circle)", level: "HIGH", vehicles_per_min: 92, speed_avg: "18 km/h" },
    { corridor: "Prakasam Barrage Approach", level: "MEDIUM", vehicles_per_min: 64, speed_avg: "24 km/h" },
    { corridor: "Governorpet 5-Roads Junction", level: "HIGH", vehicles_per_min: 86, speed_avg: "14 km/h" },
    { corridor: "Eluru Road Chuttugunta Circle", level: "LOW", vehicles_per_min: 44, speed_avg: "36 km/h" }
  ]
};
