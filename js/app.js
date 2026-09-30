/**
 * Main Application Coordinator
 * Binds all 5 architectural tiers, geospatial visualizer, timeline stepper,
 * and user interactions into a unified mission control dashboard.
 */

import { CYCLONE_SCENARIOS } from './config.js';
import { GEEPipelineManager } from './gee-pipeline.js';
import { PINNHydrodynamicEngine } from './pinn-engine.js';
import { OSMExtractor } from './osm-extractor.js';
import { GeminiOrchestrator } from './gemini-orchestrator.js';
import { CAPDispatcher } from './cap-dispatcher.js';
import { LoRaMeshSimulator } from './lorawan-mesh.js';
import { SmartContractManager } from './smart-contract.js';
import { MapVisualizer } from './map-visualizer.js';

class CyclonePlatformApp {
  constructor() {
    // Instantiate Tiers
    this.geePipeline = new GEEPipelineManager();
    this.pinnEngine = new PINNHydrodynamicEngine();
    this.osmExtractor = new OSMExtractor();
    this.geminiAgent = new GeminiOrchestrator();
    this.capDispatcher = new CAPDispatcher();
    this.loraMesh = new LoRaMeshSimulator();
    this.smartContract = new SmartContractManager();

    // Active State
    this.currentScenarioKey = "amphan";
    this.currentScenario = CYCLONE_SCENARIOS[this.currentScenarioKey];
    this.activeTimelineKey = "-72h";
    this.isPlaying = false;
    this.playInterval = null;

    // Initialize GIS Map
    this.map = new MapVisualizer('mapCanvas', 'mapTooltip');

    this.initUI();
    this.updatePlatformState();
  }

  initUI() {
    // 1. Scenario Selector
    const scenarioSelect = document.getElementById('scenarioSelect');
    if (scenarioSelect) {
      scenarioSelect.addEventListener('change', (e) => {
        this.currentScenarioKey = e.target.value;
        this.currentScenario = CYCLONE_SCENARIOS[this.currentScenarioKey];
        this.smartContract.resetContract();
        this.updatePlatformState();
      });
    }

    // 2. Timeline Step Buttons
    const stepEls = document.querySelectorAll('.timeline-step');
    stepEls.forEach(stepEl => {
      stepEl.addEventListener('click', () => {
        const stepKey = stepEl.getAttribute('data-step');
        this.setTimelineStep(stepKey);
      });
    });

    // 3. Master Trigger Anticipatory Protocol Button
    const triggerBtn = document.getElementById('btnTriggerProtocol');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        this.setTimelineStep("-72h");
        this.executeAnticipatoryTrigger();
      });
    }

    // 4. Map Layer Toggles
    const layerChecks = document.querySelectorAll('.layer-toggle input');
    layerChecks.forEach(chk => {
      chk.addEventListener('change', (e) => {
        const layerKey = e.target.name;
        if (this.map.layers.hasOwnProperty(layerKey)) {
          this.map.layers[layerKey] = e.target.checked;
          this.map.render();
        }
      });
    });

    // 5. Tier Tabs Navigation
    const tabBtns = document.querySelectorAll('.tier-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        document.querySelectorAll('.tier-tab-panel').forEach(p => p.style.display = 'none');
        const activePanel = document.getElementById(`panel-${targetTab}`);
        if (activePanel) activePanel.style.display = 'block';

        // Redraw canvas widgets if relevant
        if (targetTab === 'tier1') {
          setTimeout(() => this.geePipeline.renderHistogramCanvas('sarHistogramCanvas'), 50);
        } else if (targetTab === 'tier5') {
          setTimeout(() => this.loraMesh.renderMeshCanvas('loraMeshCanvas'), 50);
        }
      });
    });

    // 6. Cell Broadcast Siren Test Button
    const btnCBS = document.getElementById('btnCbsBroadcast');
    if (btnCBS) {
      btnCBS.addEventListener('click', () => {
        this.triggerCellBroadcastPopup();
      });
    }

    // 7. Modal Dismiss Button
    const dismissBtn = document.getElementById('btnDismissAlert');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        document.getElementById('cbsModalOverlay').classList.remove('active');
        this.capDispatcher.stopEmergencySiren();
      });
    }

    // 8. Overpass QL Selector
    const qlSelect = document.getElementById('qlCategorySelect');
    if (qlSelect) {
      qlSelect.addEventListener('change', (e) => {
        const query = this.osmExtractor.generateOverpassQL(e.target.value);
        document.getElementById('qlConsoleOutput').innerText = query;
      });
    }

    // Render initial charts
    setTimeout(() => {
      this.geePipeline.renderHistogramCanvas('sarHistogramCanvas');
      this.loraMesh.renderMeshCanvas('loraMeshCanvas');
    }, 100);
  }

  setTimelineStep(stepKey) {
    this.activeTimelineKey = stepKey;

    // Update Stepper Active State
    document.querySelectorAll('.timeline-step').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-step') === stepKey);
    });

    // Update Progress Bar Width
    const stepIndices = { "-120h": 0, "-96h": 1, "-72h": 2, "-48h": 3, "-24h": 4, "0h": 5 };
    const idx = stepIndices[stepKey] || 2;
    const pct = (idx / 5) * 94 + 3;
    const progressEl = document.getElementById('timelineProgress');
    if (progressEl) progressEl.style.width = `${pct}%`;

    this.updatePlatformState();
  }

  updatePlatformState() {
    const timelineData = this.currentScenario.timeline[this.activeTimelineKey] || this.currentScenario.timeline["-72h"];
    const leadHours = timelineData.lead;
    const pressureHpa = timelineData.pressure;
    const windsKmh = timelineData.winds;
    const rainfallRate = timelineData.rain;

    // 1. PINN Hydrodynamic Simulation
    const surgeMetrics = this.pinnEngine.calculateSurge(pressureHpa, windsKmh);
    const gnnMetrics = this.pinnEngine.simulateWatershedGNN(rainfallRate);

    // 2. OSM Vulnerability Matrix (sjoin)
    const evaluatedAssets = this.osmExtractor.evaluateVulnerability(surgeMetrics.totalSurgeMeters);
    const threatenedAssets = evaluatedAssets.filter(a => a.isFlooded);

    // 3. Gemini 3.7 Flash Multimodal Orchestrator
    const geminiAssessment = this.geminiAgent.synthesizeAnticipatoryAssessment(
      this.currentScenario,
      leadHours,
      surgeMetrics,
      evaluatedAssets
    );

    // 4. Update GIS Map
    this.map.updateData(this.currentScenario, this.activeTimelineKey, surgeMetrics.totalSurgeMeters, evaluatedAssets);

    // 5. Update HUD Displays
    this.updateHUD(leadHours, surgeMetrics, pressureHpa, windsKmh, threatenedAssets.length);

    // 6. Update Tactical Panels Content
    this.updateTacticalPanels(surgeMetrics, gnnMetrics, evaluatedAssets, geminiAssessment, rainfallRate);
  }

  updateHUD(leadHours, surgeMetrics, pressureHpa, windsKmh, threatenedCount) {
    const elLead = document.getElementById('hudLeadTime');
    const elSurge = document.getElementById('hudSurgeDepth');
    const elPressure = document.getElementById('hudPressure');
    const elWinds = document.getElementById('hudWinds');
    const elAssets = document.getElementById('hudThreatenedAssets');

    if (elLead) elLead.innerText = `T-${leadHours}h`;
    if (elSurge) elSurge.innerText = `${surgeMetrics.totalSurgeMeters}m`;
    if (elPressure) elPressure.innerText = `${pressureHpa} hPa`;
    if (elWinds) elWinds.innerText = `${windsKmh} km/h`;
    if (elAssets) elAssets.innerText = threatenedCount;
  }

  updateTacticalPanels(surgeMetrics, gnnMetrics, assets, geminiAssessment, rainfallRate) {
    // --- Tier 1 Panel Updates ---
    const imergVal = document.getElementById('valImergRain');
    if (imergVal) imergVal.innerText = `${rainfallRate} mm/h`;

    // --- Tier 2 Panel Updates ---
    const valTotalSurge = document.getElementById('valPinnSurge');
    const valBarometer = document.getElementById('valPinnBarometer');
    const valWindSurge = document.getElementById('valPinnWind');
    const valResidual = document.getElementById('valGnnResidual');

    if (valTotalSurge) valTotalSurge.innerText = `${surgeMetrics.totalSurgeMeters}m`;
    if (valBarometer) valBarometer.innerText = `+${surgeMetrics.invertedBarometerM}m`;
    if (valWindSurge) valWindSurge.innerText = `+${surgeMetrics.windSurgeM}m`;
    if (valResidual) valResidual.innerText = gnnMetrics.localMassResidual.toExponential(3);

    // --- Tier 3 Panel Updates ---
    const assetListContainer = document.getElementById('assetVulnerabilityList');
    if (assetListContainer) {
      assetListContainer.innerHTML = assets.map(a => `
        <div class="asset-item">
          <div class="asset-info">
            <span class="asset-name">${a.name}</span>
            <span class="asset-meta">Elev: ${a.elevationM}m | Depth: ${a.waterDepthM}m</span>
          </div>
          <span class="badge-risk ${a.isCritical ? 'critical' : (a.isFlooded ? 'high' : '')}">${a.status}</span>
        </div>
      `).join('');
    }

    // --- Tier 4 Panel Updates (Gemini 3.7 Flash) ---
    const reasoningContainer = document.getElementById('geminiReasoningOutput');
    if (reasoningContainer) {
      reasoningContainer.innerHTML = `
        <div class="ai-thinking-tag">
          <span>🧠 MULTIMODAL REASONING AGENT</span>
        </div>
        <div>${geminiAssessment.compoundInsight}</div>
      `;
    }

    const jsonContainer = document.getElementById('geminiJsonOutput');
    if (jsonContainer) {
      jsonContainer.innerText = JSON.stringify(geminiAssessment.structuredOutput, null, 2);
    }

    // --- Tier 5 Panel Updates (CAP & Smart Contract) ---
    const capXml = this.capDispatcher.generateXML(geminiAssessment.structuredOutput.cap_parameters);
    const capXmlContainer = document.getElementById('capXmlOutput');
    if (capXmlContainer) capXmlContainer.innerText = capXml;

    // Check Smart Contract Execution
    const settlementResult = this.smartContract.evaluateAndExecuteSettlement(
      surgeMetrics.totalSurgeMeters,
      geminiAssessment.structuredOutput.anticipatory_lead_time_hours
    );

    const contractStatusBadge = document.getElementById('contractStatusBadge');
    if (contractStatusBadge) {
      if (this.smartContract.isSettled) {
        contractStatusBadge.innerText = "SETTLED (PRE-LANDFALL 72H)";
        contractStatusBadge.style.color = "#10b981";
      } else {
        contractStatusBadge.innerText = "ESCROW LOCKED (AWAITING TRIGGER)";
        contractStatusBadge.style.color = "#f59e0b";
      }
    }

    // Payout stream table
    const payoutContainer = document.getElementById('payoutStreamList');
    if (payoutContainer && this.smartContract.disbursementLogs.length > 0) {
      payoutContainer.innerHTML = this.smartContract.disbursementLogs.map(p => `
        <div class="payout-row">
          <span class="payout-beneficiary">${p.beneficiary} (${p.district}) - ${p.provider}</span>
          <span class="payout-amount">${p.amountBdt}</span>
        </div>
      `).join('');
    }
  }

  executeAnticipatoryTrigger() {
    // 1. Trigger CBS Broadcast Popup
    this.triggerCellBroadcastPopup();

    // 2. Play Emergency Siren
    this.capDispatcher.playEmergencySiren(4);

    // 3. Fire LoRaWAN mesh burst packet
    this.loraMesh.transmitAlertPacket(38);
    this.loraMesh.renderMeshCanvas('loraMeshCanvas');

    // 4. Force Smart Contract Settlement
    const currentSurge = this.map.surgeDepthMeters;
    this.smartContract.evaluateAndExecuteSettlement(Math.max(2.6, currentSurge), 72);
    this.updatePlatformState();
  }

  triggerCellBroadcastPopup() {
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

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.cycloneApp = new CyclonePlatformApp();
});
