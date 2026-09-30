/**
 * Cyclone Prediction Platform - Scenario & Environmental Configuration
 * Contains Bay of Bengal geospatial coordinates, storm presets, and OSM assets.
 */

export const CYCLONE_SCENARIOS = {
  amphan: {
    id: "amphan-2026",
    name: "Cyclone Amphan (Super Cyclonic Storm)",
    region: "Bay of Bengal - Sundarbans & West Bengal / Khulna Coast",
    category: "Category 5 Equivalent",
    initialLeadHours: 72,
    centralPressureHpa: 920,
    maxWindsKmh: 240,
    translationSpeedKmh: 18,
    peakSurgeMeters: 4.8,
    rainfallRateMmh: 85,
    aoi: { minLat: 21.0, maxLat: 23.2, minLon: 87.5, maxLon: 91.0 },
    timeline: {
      "-120h": { lead: 120, pressure: 985, winds: 105, surge: 1.1, rain: 20, stage: "Depression Formation" },
      "-96h":  { lead: 96,  pressure: 968, winds: 140, surge: 1.8, rain: 40, stage: "Rapid Intensification" },
      "-72h":  { lead: 72,  pressure: 940, winds: 195, surge: 3.2, rain: 65, stage: "★ TRIGGER POINT (Threshold Breached)" },
      "-48h":  { lead: 48,  pressure: 928, winds: 220, surge: 4.1, rain: 78, stage: "Severe Cyclonic Phase" },
      "-24h":  { lead: 24,  pressure: 920, winds: 240, surge: 4.8, rain: 85, stage: "Pre-Landfall Peak Surge" },
      "0h":    { lead: 0,   pressure: 935, winds: 210, surge: 4.4, rain: 110, stage: "Coastal Landfall & Surge Crest" }
    }
  },
  remal: {
    id: "remal-2026",
    name: "Cyclone Remal (Severe Cyclonic Storm)",
    region: "Bangladesh Coast - Patuakhali, Barisal & Khepupara",
    category: "Category 3 Equivalent",
    initialLeadHours: 72,
    centralPressureHpa: 965,
    maxWindsKmh: 135,
    translationSpeedKmh: 15,
    peakSurgeMeters: 3.1,
    rainfallRateMmh: 68,
    aoi: { minLat: 21.3, maxLat: 23.0, minLon: 88.5, maxLon: 91.5 },
    timeline: {
      "-120h": { lead: 120, pressure: 996, winds: 65, surge: 0.8, rain: 15, stage: "Deep Depression" },
      "-96h":  { lead: 96,  pressure: 982, winds: 95, surge: 1.4, rain: 30, stage: "Cyclonic Storm Warning" },
      "-72h":  { lead: 72,  pressure: 974, winds: 115, surge: 2.6, rain: 48, stage: "★ TRIGGER POINT (Threshold Breached)" },
      "-48h":  { lead: 48,  pressure: 968, winds: 125, surge: 2.9, rain: 55, stage: "Severe Storm Inundation" },
      "-24h":  { lead: 24,  pressure: 965, winds: 135, surge: 3.1, rain: 68, stage: "Peak Surge Ingress" },
      "0h":    { lead: 0,   pressure: 972, winds: 120, surge: 2.8, rain: 95, stage: "Landfall Across Sundarbans" }
    }
  },
  mocha: {
    id: "mocha-2026",
    name: "Cyclone Mocha (Extremely Severe Cyclonic Storm)",
    region: "Cox's Bazar, Saint Martin's Island & Rakhine Coast",
    category: "Category 5 Equivalent",
    initialLeadHours: 72,
    centralPressureHpa: 938,
    maxWindsKmh: 215,
    translationSpeedKmh: 22,
    peakSurgeMeters: 3.9,
    rainfallRateMmh: 75,
    aoi: { minLat: 20.0, maxLat: 22.5, minLon: 91.2, maxLon: 93.5 },
    timeline: {
      "-120h": { lead: 120, pressure: 990, winds: 85, surge: 0.9, rain: 18, stage: "Central Bay Convergence" },
      "-96h":  { lead: 96,  pressure: 970, winds: 130, surge: 1.7, rain: 38, stage: "Eyewall Formation" },
      "-72h":  { lead: 72,  pressure: 952, winds: 175, surge: 2.9, rain: 58, stage: "★ TRIGGER POINT (Threshold Breached)" },
      "-48h":  { lead: 48,  pressure: 942, winds: 195, surge: 3.5, rain: 65, stage: "Coastal Barricade Alert" },
      "-24h":  { lead: 24,  pressure: 938, winds: 215, surge: 3.9, rain: 75, stage: "Maximum Surge Shoaling" },
      "0h":    { lead: 0,   pressure: 948, winds: 185, surge: 3.6, rain: 105, stage: "Landfall Near Sittwe" }
    }
  }
};

export const CRITICAL_OSM_INFRASTRUCTURE = [
  {
    id: "hosp_01",
    name: "Sadar Coastal District Hospital",
    category: "medical_shelter",
    lat: 22.35,
    lon: 89.92,
    elevationM: 2.1,
    beds: 250,
    tags: { amenity: "hospital", healthcare: "general" }
  },
  {
    id: "hosp_02",
    name: "Mongla Port Emergency Clinic",
    category: "medical_shelter",
    lat: 22.48,
    lon: 89.60,
    elevationM: 3.2,
    beds: 80,
    tags: { amenity: "hospital", emergency: "yes" }
  },
  {
    id: "hosp_03",
    name: "Khepupara Cyclone Refuge Healthcare Center",
    category: "medical_shelter",
    lat: 21.98,
    lon: 90.22,
    elevationM: 1.8,
    beds: 120,
    tags: { amenity: "hospital", shelter_type: "cyclone" }
  },
  {
    id: "pwr_01",
    name: "Patuakhali 132/33kV Primary Substation",
    category: "power_grid",
    lat: 22.36,
    lon: 90.33,
    elevationM: 1.9,
    voltageKv: 132,
    tags: { power: "substation", substation: "transmission" }
  },
  {
    id: "pwr_02",
    name: "Barguna Coastal Step-down Transformer Yard",
    category: "power_grid",
    lat: 22.15,
    lon: 90.12,
    elevationM: 1.4,
    voltageKv: 33,
    tags: { power: "transformer", rating: "25MVA" }
  },
  {
    id: "pwr_03",
    name: "Khulna South Distribution Hub",
    category: "power_grid",
    lat: 22.75,
    lon: 89.55,
    elevationM: 3.8,
    voltageKv: 132,
    tags: { power: "substation" }
  },
  {
    id: "hwy_01",
    name: "Arterial Highway N8 (Dhaka-Barisal-Kuakata Trunk)",
    category: "evacuation_route",
    lat: 22.10,
    lon: 90.25,
    elevationM: 1.6,
    classification: "National Highway (Primary Ingress)",
    tags: { highway: "trunk", lanes: "4" }
  },
  {
    id: "hwy_02",
    name: "Regional Corridor R880 (Barguna-Amtali Link)",
    category: "evacuation_route",
    lat: 22.05,
    lon: 90.15,
    elevationM: 1.5,
    classification: "Regional Evacuation Route",
    tags: { highway: "primary", lanes: "2" }
  },
  {
    id: "hwy_03",
    name: "Secondary Bypass R760 (Khulna-Satkhira Highway)",
    category: "evacuation_route",
    lat: 22.65,
    lon: 89.30,
    elevationM: 3.5,
    classification: "Northern High-Ground Bypass",
    tags: { highway: "primary", lanes: "2" }
  },
  {
    id: "pol_01",
    name: "Barisal Range Disaster Operations Command Center",
    category: "emergency_hub",
    lat: 22.70,
    lon: 90.37,
    elevationM: 4.2,
    personnel: 150,
    tags: { amenity: "police", headquarters: "regional" }
  },
  {
    id: "pol_02",
    name: "Kuakata Coastal Guard Tactical Outpost",
    category: "emergency_hub",
    lat: 21.82,
    lon: 90.12,
    elevationM: 1.7,
    personnel: 45,
    tags: { amenity: "police", marine: "yes" }
  }
];

export const LORAWAN_MESH_NODES = [
  { id: "lora_gw", name: "Solar LoRaWAN Gateway (Barisal Tower)", lat: 22.70, lon: 90.37, type: "gateway", batteryPct: 98, rssi: -62, snr: 10.5 },
  { id: "lora_n1", name: "Coastal Node Alpha (Patuakhali)", lat: 22.35, lon: 90.33, type: "relay", batteryPct: 92, rssi: -78, snr: 7.2 },
  { id: "lora_n2", name: "Coastal Node Bravo (Amtali)", lat: 22.05, lon: 90.22, type: "relay", batteryPct: 88, rssi: -84, snr: 5.8 },
  { id: "lora_n3", name: "Edge Siren Node Charlie (Kuakata Shore)", lat: 21.82, lon: 90.12, type: "endpoint", batteryPct: 85, rssi: -96, snr: 3.1 },
  { id: "lora_n4", name: "Mangrove Station Delta (Sundarbans East)", lat: 22.18, lon: 89.85, type: "relay", batteryPct: 94, rssi: -89, snr: 4.5 }
];
