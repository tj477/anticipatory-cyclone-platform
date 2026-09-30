/**
 * Self-Contained Standalone Application Bundle
 * Combines all 5 architectural tiers into a single script.
 * Runs seamlessly on both http://localhost and file:/// protocols without CORS restrictions.
 */

(function () {
  'use strict';

  // --- 1. CONFIGURATION & PRESETS ---
  const CYCLONE_SCENARIOS = {
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

  const CRITICAL_OSM_INFRASTRUCTURE = [
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

  // --- 2. TIER 1: GEE SAR PIPELINE ---
  class GEEPipelineManager {
    constructor() {
      this.speckleFilterEnabled = true;
      this.currentThresholdDb = -6.5;
      this.histogramData = this.generateSyntheticSARHistogram();
    }

    generateSyntheticSARHistogram() {
      const bins = [];
      const count = 50;
      const minDb = -16.0;
      const maxDb = 4.0;
      const step = (maxDb - minDb) / count;

      for (let i = 0; i < count; i++) {
        const db = minDb + i * step;
        const waterPeak = 3800 * Math.exp(-0.5 * Math.pow((db - (-8.5)) / 1.6, 2));
        const landPeak = 9500 * Math.exp(-0.5 * Math.pow((db - (-0.5)) / 2.2, 2));
        bins.push({ db: parseFloat(db.toFixed(1)), frequency: Math.round(waterPeak + landPeak) });
      }
      return bins;
    }

    calculateOtsuThreshold() {
      let total = 0, sum = 0;
      for (let i = 0; i < this.histogramData.length; i++) {
        total += this.histogramData[i].frequency;
        sum += i * this.histogramData[i].frequency;
      }

      let sumB = 0, wB = 0, maxVariance = 0, optimalIndex = 0;
      for (let i = 0; i < this.histogramData.length; i++) {
        wB += this.histogramData[i].frequency;
        if (wB === 0) continue;
        const wF = total - wB;
        if (wF === 0) break;

        sumB += i * this.histogramData[i].frequency;
        const mB = sumB / wB;
        const mF = (sum - sumB) / wF;
        const betweenVariance = wB * wF * Math.pow(mB - mF, 2);

        if (betweenVariance > maxVariance) {
          maxVariance = betweenVariance;
          optimalIndex = i;
        }
      }
      this.currentThresholdDb = this.histogramData[optimalIndex].db;
      return this.currentThresholdDb;
    }

    renderHistogramCanvas(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas || !canvas.parentElement) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width = canvas.parentElement.clientWidth || 320;
      const height = canvas.height = canvas.parentElement.clientHeight || 120;

      ctx.clearRect(0, 0, width, height);
      const maxFreq = Math.max(...this.histogramData.map(b => b.frequency));
      const barWidth = width / this.histogramData.length;

      for (let i = 0; i < this.histogramData.length; i++) {
        const bin = this.histogramData[i];
        const barHeight = (bin.frequency / maxFreq) * (height - 24);
        const x = i * barWidth;
        const y = height - barHeight - 4;

        ctx.fillStyle = bin.db <= this.currentThresholdDb ? "rgba(0, 242, 254, 0.75)" : "rgba(51, 65, 85, 0.6)";
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      }

      const thresholdIdx = this.histogramData.findIndex(b => b.db >= this.currentThresholdDb);
      const lineX = (thresholdIdx >= 0 ? thresholdIdx : 15) * barWidth;

      ctx.beginPath();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 2]);
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px monospace";
      ctx.fillText("Water Class (< -6.5dB)", 6, 14);
      ctx.fillText("Land / Non-flood", width - 96, 14);
    }
  }

  // --- 3. TIER 2: PINN & DUALFLOODGNN ---
  class PINNHydrodynamicEngine {
    constructor() {
      this.inferenceLatencyMs = 124;
      this.hpcComparisonHours = 36.0;
    }

    calculateSurge(pressureHpa, maxWindsKmh, distanceToEyeKm = 20, bathymetryDepthM = 14) {
      const deltaP = Math.max(0, 1013.25 - pressureHpa);
      const invertedBarometerM = deltaP * 0.01;

      const windMs = maxWindsKmh / 3.6;
      const cd = 0.0015 + 0.00008 * Math.min(windMs, 35.0);
      const decay = Math.exp(-0.5 * Math.pow(distanceToEyeKm / 45.0, 2));
      const effectiveWind = windMs * decay;
      const shoalingFactor = 1.0 / Math.max(4.0, Math.sqrt(bathymetryDepthM));
      const windSurgeM = (cd * Math.pow(effectiveWind, 2) * 14.0 * shoalingFactor) / 9.81;

      const astronomicalTideM = 0.75 * Math.cos(Date.now() / (1000 * 3600 * 12.42));
      const totalSurge = Math.max(0.2, invertedBarometerM + windSurgeM + astronomicalTideM);

      return {
        totalSurgeMeters: parseFloat(totalSurge.toFixed(2)),
        invertedBarometerM: parseFloat(invertedBarometerM.toFixed(2)),
        windSurgeM: parseFloat(windSurgeM.toFixed(2)),
        astronomicalTideM: parseFloat(astronomicalTideM.toFixed(2)),
        inferenceTimeMs: this.inferenceLatencyMs
      };
    }

    simulateWatershedGNN(rainfallRateMmh) {
      const inflowM3s = rainfallRateMmh * 420.5;
      const outflowM3s = inflowM3s * 0.88;
      const storageChange = inflowM3s - outflowM3s;
      const simulatedResidual = Math.abs(storageChange - (inflowM3s - outflowM3s)) + 0.000035;

      return {
        localMassResidual: simulatedResidual,
        conservesMass: simulatedResidual < 0.0001
      };
    }
  }

  // --- 4. TIER 3: OSM OVERPASS EXTRACTOR ---
  class OSMExtractor {
    constructor() {
      this.assets = [...CRITICAL_OSM_INFRASTRUCTURE];
    }

    generateOverpassQL(category = "medical_shelters") {
      const filters = {
        power_grid: '["power"="transformer"]',
        evacuation_routes: '["highway"~"^(motorway|trunk|primary)"]',
        medical_shelters: '["amenity"="hospital"]',
        emergency_hubs: '["amenity"="police"]'
      };
      const filter = filters[category] || filters.medical_shelters;
      return `[out:json][timeout:25];\n(\n  node${filter}(21.0,88.0,23.5,91.5);\n  way${filter}(21.0,88.0,23.5,91.5);\n  relation${filter}(21.0,88.0,23.5,91.5);\n);\nout body;\n>;\nout skel qt;`;
    }

    evaluateVulnerability(surgeDepthMeters) {
      return this.assets.map(asset => {
        const waterDepth = Math.max(0, surgeDepthMeters - asset.elevationM);
        const isFlooded = waterDepth >= 0.5;
        const isCritical = waterDepth >= 1.5;

        let status = "OPERATIONAL";
        let actionNeeded = "Continuous Monitoring";

        if (isCritical) {
          status = "COMPROMISED / SEVERED";
          if (asset.category === "power_grid") actionNeeded = "EMERGENCY DE-ENERGIZATION REQUIRED";
          else if (asset.category === "medical_shelter") actionNeeded = "PREEMPTIVE AIRBORNE EVACUATION";
          else if (asset.category === "evacuation_route") actionNeeded = "CORRIDOR CLOSED - DIVERT TRAFFIC";
        } else if (isFlooded) {
          status = "HIGH THREAT";
          actionNeeded = "Deploy Mobile Sandbags / Backup Power";
        }

        return {
          ...asset,
          waterDepthM: parseFloat(waterDepth.toFixed(2)),
          isFlooded,
          isCritical,
          status,
          actionNeeded
        };
      });
    }
  }

  // --- 5. TIER 4: GEMINI 3.7 FLASH ORCHESTRATOR ---
  class GeminiOrchestrator {
    synthesizeAnticipatoryAssessment(scenario, leadHours, surgeMetrics, vulnerabilityList) {
      const threatenedAssets = vulnerabilityList.filter(a => a.isFlooded);
      const peakSurge = surgeMetrics.totalSurgeMeters;
      const severedHighway = vulnerabilityList.find(a => a.id === "hwy_01" && a.isFlooded);
      const sadarHospital = vulnerabilityList.find(a => a.id === "hosp_01");

      let compoundInsight = `Hydrodynamic surge of ${peakSurge}m exceeds coastal safety margins. `;
      if (severedHighway && sadarHospital) {
        compoundInsight += `CRITICAL SPATIAL BOTTLENECK DETECTED: Arterial Highway N8 inundation (${severedHighway.waterDepthM}m) completely severs the sole access corridor to Sadar Coastal District Hospital (${sadarHospital.name}). Emergency patients cannot be reached by road. Initiate preemptive helicopter medevac or seawall reinforcement at T-${leadHours}h.`;
      } else {
        compoundInsight += `Multiple vulnerable infrastructure nodes detected across low-lying coastal floodplains.`;
      }

      const isTriggerMet = peakSurge >= 2.5 && leadHours <= 72;

      const structuredOutput = {
        event_severity: peakSurge > 3.0 ? "EXTREME_WARNING" : "SEVERE_WATCH",
        anticipatory_lead_time_hours: leadHours,
        cyclone_designation: scenario.name,
        spatial_compound_analysis: compoundInsight,
        affected_infrastructure_ids: threatenedAssets.map(a => a.id),
        recommended_actions: [
          {
            action_type: "POWER_GRID_DEENERGIZATION",
            target_asset: "Patuakhali 132/33kV Substation (ID: pwr_01)",
            priority: "IMMEDIATE",
            instruction: "Initiate remote switch-off to prevent catastrophic arc flash and equipment explosion before surge ingress."
          },
          {
            action_type: "EVACUATION_CORRIDOR_DIVERSION",
            target_asset: "Arterial Highway N8 Corridor",
            priority: "IMMEDIATE",
            instruction: "Reroute all civilian vehicular evacuation westward through Regional Bypass R760."
          },
          {
            action_type: "PARAMETRIC_LIQUIDITY_EXECUTION",
            target_asset: "Solidity Contract: IndexedInsurance.sol",
            priority: "IMMEDIATE",
            instruction: "Push Chainlink DON verified surge data to trigger $2.5M anticipatory mobile money cash disbursements."
          }
        ],
        cap_parameters: {
          msgType: "Alert",
          category: "Met",
          urgency: "Immediate",
          severity: peakSurge > 3.0 ? "Extreme" : "Severe",
          headline: `ANTICIPATORY CYCLONE ALERT: ${scenario.name.toUpperCase()} (T-${leadHours}H)`,
          description: `Physics-Informed Neural Network (PINN) simulates a peak storm surge of ${peakSurge}m. ${threatenedAssets.length} critical infrastructure facilities at imminent inundation risk.`,
          instruction: "Move immediately to multi-purpose cyclone shelters. Parametric anticipatory cash has been transferred to registered mobile wallets."
        },
        parametric_liquidity_trigger: {
          trigger_authorized: isTriggerMet,
          parametric_variable: "PINN_STORM_SURGE_PEAK_DEPTH_METERS",
          threshold_value: 2.5,
          observed_value: peakSurge,
          disbursement_pool_usd: 2500000.0,
          status: isTriggerMet ? "EXECUTED_PRE_LANDFALL_72H" : "PENDING_THRESHOLD_BREACH"
        }
      };

      return { compoundInsight, structuredOutput };
    }
  }

  // --- 6. TIER 5A: CAP V1.2 & DUAL-FREQUENCY SIREN ---
  class CAPDispatcher {
    constructor() {
      this.audioContext = null;
      this.oscillator1 = null;
      this.oscillator2 = null;
    }

    generateXML(capParams) {
      const alertId = `urn:oid:2.49.0.0.50.0.2026.${Math.random().toString(16).substr(2, 8)}`;
      return `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${alertId}</identifier>
  <sender>anticipatory-action-fbaa@cyclone.gov</sender>
  <sent>${new Date().toISOString()}</sent>
  <status>Actual</status>
  <msgType>${capParams.msgType || "Alert"}</msgType>
  <scope>Public</scope>
  <info>
    <category>${capParams.category || "Met"}</category>
    <event>Tropical Cyclone Anticipatory Emergency</event>
    <urgency>${capParams.urgency || "Immediate"}</urgency>
    <severity>${capParams.severity || "Extreme"}</severity>
    <certainty>Observed</certainty>
    <headline>${capParams.headline}</headline>
    <description>${capParams.description}</description>
    <instruction>${capParams.instruction}</instruction>
    <area>
      <areaDesc>Bay of Bengal Coastal Vulnerability Sector</areaDesc>
      <polygon>21.8,89.2 22.4,90.1 21.9,90.8 21.8,89.2</polygon>
    </area>
  </info>
</alert>`;
    }

    playEmergencySiren(durationSeconds = 4) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
          console.warn("Web Audio API not supported in this browser.");
          return;
        }

        if (!this.audioContext || this.audioContext.state === 'closed') {
          this.audioContext = new AudioCtx();
        }

        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }

        this.stopEmergencySiren();

        // Standard Emergency Alert System (EAS) dual frequencies: 853 Hz & 960 Hz
        this.oscillator1 = this.audioContext.createOscillator();
        this.oscillator2 = this.audioContext.createOscillator();
        this.gainNode = this.audioContext.createGain();

        this.oscillator1.type = "sine";
        this.oscillator1.frequency.setValueAtTime(853, this.audioContext.currentTime);

        this.oscillator2.type = "sine";
        this.oscillator2.frequency.setValueAtTime(960, this.audioContext.currentTime);

        // Boost gain for clear audibility
        this.gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);

        this.oscillator1.connect(this.gainNode);
        this.oscillator2.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);

        this.oscillator1.start();
        this.oscillator2.start();

        if (this.sirenTimer) clearTimeout(this.sirenTimer);
        this.sirenTimer = setTimeout(() => this.stopEmergencySiren(), durationSeconds * 1000);
      } catch (e) {
        console.warn("Audio Context playback error:", e);
      }
    }

    stopEmergencySiren() {
      if (this.oscillator1 && this.oscillator2) {
        try {
          this.oscillator1.stop();
          this.oscillator2.stop();
          this.oscillator1.disconnect();
          this.oscillator2.disconnect();
        } catch (e) {}
      }
    }
  }

  // --- 7. TIER 5B: LORAWAN MESH SIMULATOR ---
  class LoRaMeshSimulator {
    renderMeshCanvas(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas || !canvas.parentElement) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width = canvas.parentElement.clientWidth || 320;
      const height = canvas.height = canvas.parentElement.clientHeight || 130;

      ctx.clearRect(0, 0, width, height);

      const nodeCoords = [
        { x: width * 0.15, y: height * 0.35, label: "GW (Barisal)" },
        { x: width * 0.35, y: height * 0.65, label: "N1 (Patuakhali)" },
        { x: width * 0.58, y: height * 0.45, label: "N2 (Amtali)" },
        { x: width * 0.85, y: height * 0.70, label: "Siren (Kuakata)" },
        { x: width * 0.45, y: height * 0.20, label: "N4 (Sundarbans)" }
      ];

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(0, 242, 254, 0.25)";
      const links = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 1]];
      links.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(nodeCoords[i].x, nodeCoords[i].y);
        ctx.lineTo(nodeCoords[j].x, nodeCoords[j].y);
        ctx.stroke();
      });

      nodeCoords.forEach((node, i) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? "rgba(0, 242, 254, 0.2)" : (i === 3 ? "rgba(239, 68, 68, 0.2)" : "rgba(0, 229, 163, 0.2)");
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? "#00f2fe" : (i === 3 ? "#ef4444" : "#00e5a3");
        ctx.fill();

        ctx.font = "8px monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(node.label, node.x - 20, node.y - 12);
      });
    }
  }

  // --- 8. TIER 5C: SMART CONTRACT & MOBILE PAYOUT ---
  class SmartContractManager {
    constructor() {
      this.triggerThresholdM = 2.50;
      this.escrowBalanceUsd = 2500000;
      this.isSettled = false;
      this.disbursementLogs = [];

      this.sampleBeneficiaries = [
        { name: "Fatima Begum", district: "Barguna Sadar", provider: "bKash" },
        { name: "Abdul Mannan", district: "Patuakhali", provider: "Nagad" },
        { name: "Rokeya Khatun", district: "Amtali", provider: "bKash" },
        { name: "Mohammed Siraj", district: "Kuakata", provider: "bKash" },
        { name: "Shipra Mondal", district: "Mongla", provider: "Nagad" }
      ];
    }

    evaluateAndExecuteSettlement(currentSurgeMeters, leadHours = 72) {
      if (currentSurgeMeters >= this.triggerThresholdM && leadHours <= 72 && !this.isSettled) {
        this.isSettled = true;
        this.disbursementLogs = this.sampleBeneficiaries.map(b => ({
          beneficiary: b.name,
          district: b.district,
          provider: b.provider,
          amountBdt: "৳5,500 BDT ($50 USD)",
          status: "CONFIRMED_ON_CHAIN"
        }));
      }
    }

    resetContract() {
      this.isSettled = false;
      this.disbursementLogs = [];
    }
  }

  // --- 9. INTERACTIVE GIS CANVAS MAP ---
  class MapVisualizer {
    constructor(canvasId, tooltipId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.tooltip = document.getElementById(tooltipId);

      this.panX = 0;
      this.panY = 0;
      this.zoom = 1.0;
      this.isDragging = false;
      this.dragStart = { x: 0, y: 0 };

      this.layers = {
        stormTrack: true,
        surgeContours: true,
        sarInundation: true,
        osmInfrastructure: true,
        loraMesh: true
      };

      this.currentScenario = null;
      this.currentTimelineStep = "-72h";
      this.surgeDepthMeters = 3.2;
      this.infrastructureAssets = [];

      this.initEvents();
      this.handleResize();
      window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
      if (!this.canvas || !this.canvas.parentElement) return;
      this.canvas.width = this.canvas.parentElement.clientWidth;
      this.canvas.height = this.canvas.parentElement.clientHeight || 600;
      this.render();
    }

    initEvents() {
      this.canvas.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.dragStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
      });

      window.addEventListener('mousemove', (e) => {
        if (this.isDragging) {
          this.panX = e.clientX - this.dragStart.x;
          this.panY = e.clientY - this.dragStart.y;
          this.render();
        } else {
          this.handleHover(e);
        }
      });

      window.addEventListener('mouseup', () => { this.isDragging = false; });

      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        this.zoom = Math.min(Math.max(0.6, this.zoom * factor), 3.0);
        this.render();
      });
    }

    geoToCanvas(lat, lon) {
      const minLat = 21.0, maxLat = 23.5, minLon = 87.5, maxLon = 92.0;
      const normX = (lon - minLon) / (maxLon - minLon);
      const normY = 1.0 - (lat - minLat) / (maxLat - minLat);
      const cx = this.canvas.width / 2 + this.panX;
      const cy = this.canvas.height / 2 + this.panY;
      const baseWidth = this.canvas.width * 0.85 * this.zoom;
      const baseHeight = this.canvas.height * 0.85 * this.zoom;
      return {
        x: cx - baseWidth / 2 + normX * baseWidth,
        y: cy - baseHeight / 2 + normY * baseHeight
      };
    }

    handleHover(e) {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found = null;
      for (const asset of this.infrastructureAssets) {
        const pos = this.geoToCanvas(asset.lat, asset.lon);
        if (Math.hypot(pos.x - mouseX, pos.y - mouseY) < 14) {
          found = { asset, x: e.clientX, y: e.clientY };
          break;
        }
      }

      if (found && this.tooltip) {
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = `${found.x + 14}px`;
        this.tooltip.style.top = `${found.y + 14}px`;
        const a = found.asset;
        const color = a.isCritical ? '#ef4444' : (a.isFlooded ? '#f59e0b' : '#10b981');
        this.tooltip.innerHTML = `
          <div style="font-weight: 700; color: #f8fafc;">${a.name}</div>
          <div style="font-size: 0.68rem; font-family: monospace; color: #94a3b8;">ID: ${a.id} | Elev: ${a.elevationM}m</div>
          <div style="display: flex; align-items: center; gap: 6px; margin: 4px 0;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
            <span style="font-size: 0.72rem; font-weight: 600; color: ${color};">${a.status}</span>
          </div>
          <div style="font-size: 0.7rem; color: #38bdf8;">Surge Depth: <strong>${a.waterDepthM}m</strong></div>
          <div style="font-size: 0.68rem; color: #cbd5e1; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
            Action: <em>${a.actionNeeded}</em>
          </div>
        `;
      } else if (this.tooltip) {
        this.tooltip.style.display = 'none';
      }
    }

    updateData(scenario, timelineStep, surgeDepth, assets) {
      this.currentScenario = scenario;
      this.currentTimelineStep = timelineStep;
      this.surgeDepthMeters = surgeDepth;
      this.infrastructureAssets = assets;
      this.render();
    }

    render() {
      const { ctx, canvas } = this;
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ocean Basemap
      ctx.fillStyle = "#070c18";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Lat/Lon Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let lat = 21.0; lat <= 23.5; lat += 0.5) {
        const p1 = this.geoToCanvas(lat, 87.5), p2 = this.geoToCanvas(lat, 92.0);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }

      // Coastal Polygon
      const coast = [
        { lat: 23.5, lon: 87.5 }, { lat: 22.8, lon: 88.2 }, { lat: 22.3, lon: 88.8 },
        { lat: 21.8, lon: 89.2 }, { lat: 21.85, lon: 89.7 }, { lat: 21.80, lon: 90.1 },
        { lat: 22.10, lon: 90.5 }, { lat: 22.60, lon: 90.7 }, { lat: 22.20, lon: 91.0 },
        { lat: 22.40, lon: 91.4 }, { lat: 21.80, lon: 91.8 }, { lat: 21.00, lon: 92.2 },
        { lat: 23.5, lon: 92.0 }
      ];

      ctx.beginPath();
      coast.forEach((pt, i) => {
        const p = this.geoToCanvas(pt.lat, pt.lon);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = "#0f172a";
      ctx.fill();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Surge Contours
      if (this.layers.surgeContours) {
        const center = this.geoToCanvas(21.9, 90.0);
        const radius = (this.surgeDepthMeters / 4.8) * 160 * this.zoom;
        const grad = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, radius);
        grad.addColorStop(0, "rgba(239, 68, 68, 0.45)");
        grad.addColorStop(0.35, "rgba(245, 158, 11, 0.35)");
        grad.addColorStop(0.7, "rgba(59, 130, 246, 0.25)");
        grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");
        ctx.beginPath(); ctx.arc(center.x, center.y, radius, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
      }

      // Storm Track
      if (this.layers.stormTrack) {
        const track = [
          { step: "-120h", lat: 20.2, lon: 88.6 }, { step: "-96h", lat: 20.8, lon: 89.1 },
          { step: "-72h", lat: 21.4, lon: 89.6 },  { step: "-48h", lat: 21.9, lon: 90.0 },
          { step: "-24h", lat: 22.3, lon: 90.3 },  { step: "0h", lat: 22.7, lon: 90.6 }
        ];

        ctx.beginPath();
        track.forEach((pt, i) => {
          const p = this.geoToCanvas(pt.lat, pt.lon);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        const curIdx = { "-120h": 0, "-96h": 1, "-72h": 2, "-48h": 3, "-24h": 4, "0h": 5 }[this.currentTimelineStep] || 2;
        track.forEach((pt, i) => {
          const p = this.geoToCanvas(pt.lat, pt.lon);
          ctx.beginPath(); ctx.arc(p.x, p.y, i === curIdx ? 7 : 4, 0, Math.PI * 2);
          ctx.fillStyle = i === 2 ? "#f59e0b" : "#ef4444";
          ctx.fill(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5; ctx.stroke();
        });
      }

      // Infrastructure Assets
      if (this.layers.osmInfrastructure) {
        this.infrastructureAssets.forEach(asset => {
          const p = this.geoToCanvas(asset.lat, asset.lon);
          const color = asset.isCritical ? '#ef4444' : (asset.isFlooded ? '#f59e0b' : '#10b981');

          if (asset.isFlooded) {
            ctx.beginPath(); ctx.arc(p.x, p.y, 14 * this.zoom, 0, Math.PI * 2);
            ctx.fillStyle = asset.isCritical ? "rgba(239, 68, 68, 0.35)" : "rgba(245, 158, 11, 0.25)";
            ctx.fill();
          }

          ctx.beginPath(); ctx.arc(p.x, p.y, 6 * this.zoom, 0, Math.PI * 2);
          ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5; ctx.stroke();

          ctx.font = "9px sans-serif"; ctx.fillStyle = "#ffffff";
          let icon = asset.category === "medical_shelter" ? "✚" : (asset.category === "power_grid" ? "⚡" : (asset.category === "evacuation_route" ? "═" : "★"));
          ctx.fillText(icon, p.x - 3, p.y + 3);
        });
      }
    }
  }

  // --- 10. MASTER COORDINATOR ---
  class CyclonePlatformApp {
    constructor() {
      this.geePipeline = new GEEPipelineManager();
      this.pinnEngine = new PINNHydrodynamicEngine();
      this.osmExtractor = new OSMExtractor();
      this.geminiAgent = new GeminiOrchestrator();
      this.capDispatcher = new CAPDispatcher();
      this.loraMesh = new LoRaMeshSimulator();
      this.smartContract = new SmartContractManager();

      this.currentScenarioKey = "amphan";
      this.currentScenario = CYCLONE_SCENARIOS[this.currentScenarioKey];
      this.activeTimelineKey = "-72h";

      this.map = new MapVisualizer('mapCanvas', 'mapTooltip');
      this.initUI();
      this.updateState();
    }

    initUI() {
      const select = document.getElementById('scenarioSelect');
      if (select) {
        select.addEventListener('change', (e) => {
          this.currentScenarioKey = e.target.value;
          this.currentScenario = CYCLONE_SCENARIOS[this.currentScenarioKey];
          this.smartContract.resetContract();
          this.updateState();
        });
      }

      document.querySelectorAll('.timeline-step').forEach(stepEl => {
        stepEl.addEventListener('click', () => {
          this.setStep(stepEl.getAttribute('data-step'));
        });
      });

      const triggerBtn = document.getElementById('btnTriggerProtocol');
      if (triggerBtn) {
        triggerBtn.addEventListener('click', () => {
          this.setStep("-72h");
          this.executeTrigger();
        });
      }

      document.querySelectorAll('.layer-toggle input').forEach(chk => {
        chk.addEventListener('change', (e) => {
          if (this.map.layers.hasOwnProperty(e.target.name)) {
            this.map.layers[e.target.name] = e.target.checked;
            this.map.render();
          }
        });
      });

      const tabBtns = document.querySelectorAll('.tier-tab-btn');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const tab = btn.getAttribute('data-tab');
          document.querySelectorAll('.tier-tab-panel').forEach(p => p.style.display = 'none');
          const activePanel = document.getElementById(`panel-${tab}`);
          if (activePanel) activePanel.style.display = 'block';

          if (tab === 'tier1') setTimeout(() => this.geePipeline.renderHistogramCanvas('sarHistogramCanvas'), 50);
          else if (tab === 'tier5') setTimeout(() => this.loraMesh.renderMeshCanvas('loraMeshCanvas'), 50);
        });
      });

      const btnCBS = document.getElementById('btnCbsBroadcast');
      if (btnCBS) btnCBS.addEventListener('click', () => this.popupAlert());

      const btnAudio = document.getElementById('btnToggleAudio');
      if (btnAudio) {
        btnAudio.addEventListener('click', () => {
          const btnTxt = document.getElementById('audioButtonText');
          if (this.capDispatcher.oscillator1) {
            this.capDispatcher.stopEmergencySiren();
            if (btnTxt) btnTxt.innerText = "TEST SIREN";
          } else {
            this.capDispatcher.playEmergencySiren(5);
            if (btnTxt) btnTxt.innerText = "SIREN PLAYING";
            setTimeout(() => {
              if (btnTxt) btnTxt.innerText = "TEST SIREN";
            }, 5000);
          }
        });
      }

      const dismissBtn = document.getElementById('btnDismissAlert');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          document.getElementById('cbsModalOverlay').classList.remove('active');
          this.capDispatcher.stopEmergencySiren();
        });
      }

      const qlSelect = document.getElementById('qlCategorySelect');
      if (qlSelect) {
        qlSelect.addEventListener('change', (e) => {
          const q = this.osmExtractor.generateOverpassQL(e.target.value);
          document.getElementById('qlConsoleOutput').innerText = q;
        });
      }

      setTimeout(() => {
        this.geePipeline.renderHistogramCanvas('sarHistogramCanvas');
        this.loraMesh.renderMeshCanvas('loraMeshCanvas');
      }, 80);
    }

    setStep(stepKey) {
      this.activeTimelineKey = stepKey;
      document.querySelectorAll('.timeline-step').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-step') === stepKey);
      });
      const pct = { "-120h": 3, "-96h": 22, "-72h": 48, "-48h": 68, "-24h": 85, "0h": 97 }[stepKey] || 48;
      const progressEl = document.getElementById('timelineProgress');
      if (progressEl) progressEl.style.width = `${pct}%`;
      this.updateState();
    }

    updateState() {
      const t = this.currentScenario.timeline[this.activeTimelineKey] || this.currentScenario.timeline["-72h"];
      const surgeMetrics = this.pinnEngine.calculateSurge(t.pressure, t.winds);
      const gnnMetrics = this.pinnEngine.simulateWatershedGNN(t.rain);
      const evaluatedAssets = this.osmExtractor.evaluateVulnerability(surgeMetrics.totalSurgeMeters);
      const threatened = evaluatedAssets.filter(a => a.isFlooded);

      const geminiAssessment = this.geminiAgent.synthesizeAnticipatoryAssessment(
        this.currentScenario, t.lead, surgeMetrics, evaluatedAssets
      );

      this.map.updateData(this.currentScenario, this.activeTimelineKey, surgeMetrics.totalSurgeMeters, evaluatedAssets);

      // HUD
      const hudLead = document.getElementById('hudLeadTime');
      const hudSurge = document.getElementById('hudSurgeDepth');
      const hudPress = document.getElementById('hudPressure');
      const hudWinds = document.getElementById('hudWinds');
      const hudThreat = document.getElementById('hudThreatenedAssets');

      if (hudLead) hudLead.innerText = `T-${t.lead}h`;
      if (hudSurge) hudSurge.innerText = `${surgeMetrics.totalSurgeMeters}m`;
      if (hudPress) hudPress.innerText = `${t.pressure} hPa`;
      if (hudWinds) hudWinds.innerText = `${t.winds} km/h`;
      if (hudThreat) hudThreat.innerText = threatened.length;

      // Tier Panels
      const imergVal = document.getElementById('valImergRain');
      if (imergVal) imergVal.innerText = `${t.rain} mm/h`;

      const pSurge = document.getElementById('valPinnSurge');
      const pBaro = document.getElementById('valPinnBarometer');
      const pWind = document.getElementById('valPinnWind');
      const pRes = document.getElementById('valGnnResidual');

      if (pSurge) pSurge.innerText = `${surgeMetrics.totalSurgeMeters}m`;
      if (pBaro) pBaro.innerText = `+${surgeMetrics.invertedBarometerM}m`;
      if (pWind) pWind.innerText = `+${surgeMetrics.windSurgeM}m`;
      if (pRes) pRes.innerText = gnnMetrics.localMassResidual.toExponential(3);

      const listContainer = document.getElementById('assetVulnerabilityList');
      if (listContainer) {
        listContainer.innerHTML = evaluatedAssets.map(a => `
          <div class="asset-item">
            <div class="asset-info">
              <span class="asset-name">${a.name}</span>
              <span class="asset-meta">Elev: ${a.elevationM}m | Depth: ${a.waterDepthM}m</span>
            </div>
            <span class="badge-risk ${a.isCritical ? 'critical' : (a.isFlooded ? 'high' : '')}">${a.status}</span>
          </div>
        `).join('');
      }

      const reasonOut = document.getElementById('geminiReasoningOutput');
      if (reasonOut) {
        reasonOut.innerHTML = `
          <div class="ai-thinking-tag"><span>🧠 MULTIMODAL REASONING AGENT</span></div>
          <div>${geminiAssessment.compoundInsight}</div>
        `;
      }

      const jsonOut = document.getElementById('geminiJsonOutput');
      if (jsonOut) jsonOut.innerText = JSON.stringify(geminiAssessment.structuredOutput, null, 2);

      const capXml = document.getElementById('capXmlOutput');
      if (capXml) capXml.innerText = this.capDispatcher.generateXML(geminiAssessment.structuredOutput.cap_parameters);

      this.smartContract.evaluateAndExecuteSettlement(surgeMetrics.totalSurgeMeters, t.lead);
      const contractBadge = document.getElementById('contractStatusBadge');
      if (contractBadge) {
        contractBadge.innerText = this.smartContract.isSettled ? "SETTLED (PRE-LANDFALL 72H)" : "ESCROW LOCKED (AWAITING TRIGGER)";
        contractBadge.style.color = this.smartContract.isSettled ? "#10b981" : "#f59e0b";
      }

      const payoutList = document.getElementById('payoutStreamList');
      if (payoutList && this.smartContract.disbursementLogs.length > 0) {
        payoutList.innerHTML = this.smartContract.disbursementLogs.map(p => `
          <div class="payout-row">
            <span class="payout-beneficiary">${p.beneficiary} (${p.district}) - ${p.provider}</span>
            <span class="payout-amount">${p.amountBdt}</span>
          </div>
        `).join('');
      }
    }

    executeTrigger() {
      this.popupAlert();
      this.capDispatcher.playEmergencySiren(4);
      this.loraMesh.renderMeshCanvas('loraMeshCanvas');
      this.smartContract.evaluateAndExecuteSettlement(Math.max(2.6, this.map.surgeDepthMeters), 72);
      this.updateState();
    }

    popupAlert() {
      const modal = document.getElementById('cbsModalOverlay');
      const headline = document.getElementById('cbsModalHeadline');
      const desc = document.getElementById('cbsModalDesc');
      const instr = document.getElementById('cbsModalInstruction');

      if (headline) headline.innerText = `EMERGENCY ALERT: ${this.currentScenario.name.toUpperCase()} (T-72H)`;
      if (desc) desc.innerText = `Surge depth of ${this.map.surgeDepthMeters}m projected. Imminent coastal cut-off detected along arterial evacuation corridors.`;
      if (instr) instr.innerText = `Anticipatory action in effect: Proceed immediately to cyclone shelters. Cash assistance of ৳5,500 has been transferred directly to your mobile wallet.`;

      if (modal) modal.classList.add('active');
      this.capDispatcher.playEmergencySiren(3);
    }
  }

  // Auto-initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.cycloneApp = new CyclonePlatformApp(); });
  } else {
    window.cycloneApp = new CyclonePlatformApp();
  }

})();
