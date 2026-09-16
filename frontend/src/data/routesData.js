export const BUS_ROUTES = [
  {
    id: "ASTRA-101",
    name: "Central Corridor (PNBS - Benz Circle)",
    color: "#06b6d4", // Cyan
    coordinates: [
      [16.5182, 80.6190],
      [16.5145, 80.6275],
      [16.5098, 80.6380],
      [16.5074, 80.6482],
      [16.5035, 80.6558],
      [16.4998, 80.6625],
      [16.4950, 80.6720],
      [16.4910, 80.6835]
    ]
  },
  {
    id: "ASTRA-102",
    name: "Prakasam Riverfront (Station - Tadepalli)",
    color: "#3b82f6", // Blue
    coordinates: [
      [16.5185, 80.6199],
      [16.5120, 80.6150],
      [16.5085, 80.6080],
      [16.5060, 80.6050],
      [16.4995, 80.6070],
      [16.4890, 80.6110],
      [16.4780, 80.6145]
    ]
  },
  {
    id: "ASTRA-103",
    name: "MG Road City Loop",
    color: "#a855f7", // Purple
    coordinates: [
      [16.5080, 80.6320],
      [16.5065, 80.6410],
      [16.5042, 80.6505],
      [16.5015, 80.6590],
      [16.4998, 80.6625],
      [16.5050, 80.6650],
      [16.5125, 80.6580],
      [16.5140, 80.6480],
      [16.5080, 80.6320]
    ]
  },
  {
    id: "ASTRA-104",
    name: "Gunadala Heritage Line",
    color: "#10b981", // Emerald
    coordinates: [
      [16.5190, 80.6280],
      [16.5220, 80.6370],
      [16.5245, 80.6475],
      [16.5270, 80.6590],
      [16.5250, 80.6680],
      [16.5180, 80.6720]
    ]
  },
  {
    id: "ASTRA-105",
    name: "Amaravati NH-16 Link",
    color: "#f59e0b", // Amber
    coordinates: [
      [16.4998, 80.6625],
      [16.4880, 80.6600],
      [16.4750, 80.6550],
      [16.4620, 80.6500],
      [16.4520, 80.6450]
    ]
  }
];

export const CONGESTION_SEGMENTS = [
  {
    name: "MG Road (Benz Circle Corridor)",
    level: "HIGH",
    vehicles_min: 92,
    color: "#ef4444", // Red
    coordinates: [
      [16.5035, 80.6558],
      [16.4998, 80.6625]
    ]
  },
  {
    name: "Governorpet 5-Roads Junction",
    level: "HIGH",
    vehicles_min: 86,
    color: "#ef4444",
    coordinates: [
      [16.5145, 80.6275],
      [16.5098, 80.6380]
    ]
  },
  {
    name: "Prakasam Barrage Approach",
    level: "MEDIUM",
    vehicles_min: 64,
    color: "#f59e0b", // Yellow/Amber
    coordinates: [
      [16.5060, 80.6050],
      [16.4995, 80.6070]
    ]
  },
  {
    name: "Eluru Road Chuttugunta",
    level: "MEDIUM",
    vehicles_min: 58,
    color: "#f59e0b",
    coordinates: [
      [16.5220, 80.6370],
      [16.5245, 80.6475]
    ]
  },
  {
    name: "NH-16 Outer Bypass Link",
    level: "LOW",
    vehicles_min: 32,
    color: "#10b981", // Green
    coordinates: [
      [16.4750, 80.6550],
      [16.4520, 80.6450]
    ]
  }
];
