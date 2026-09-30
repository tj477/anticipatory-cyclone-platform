/**
 * Geospatial GIS Canvas Visualizer
 * High-performance interactive rendering of Bay of Bengal coastal geography,
 * PINN hydrodynamic storm surge contours, storm track cone, and OSM infrastructure nodes.
 */

export class MapVisualizer {
  constructor(canvasId, tooltipId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.tooltip = document.getElementById(tooltipId);

    // Map View State
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1.0;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };

    // Layer Visibility Flags
    this.layers = {
      stormTrack: true,
      surgeContours: true,
      sarInundation: true,
      osmInfrastructure: true,
      loraMesh: true
    };

    // Active Simulation State
    this.currentScenario = null;
    this.currentTimelineStep = "-72h";
    this.surgeDepthMeters = 3.2;
    this.infrastructureAssets = [];
    this.hoveredAsset = null;

    this.initEventListeners();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight || 600;
    this.render();
  }

  initEventListeners() {
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
        this.handleMapHover(e);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.zoom = Math.min(Math.max(0.6, this.zoom * zoomFactor), 3.0);
      this.render();
    });
  }

  // Convert Geo Coordinates (Lat, Lon) to Canvas XY
  geoToCanvas(lat, lon) {
    // Geo Bounds: Lat 21.0 - 23.5, Lon 87.5 - 92.0
    const minLat = 21.0, maxLat = 23.5;
    const minLon = 87.5, maxLon = 92.0;

    const normX = (lon - minLon) / (maxLon - minLon);
    const normY = 1.0 - (lat - minLat) / (maxLat - minLat);

    const cx = this.canvas.width / 2 + this.panX;
    const cy = this.canvas.height / 2 + this.panY;

    const baseWidth = this.canvas.width * 0.85 * this.zoom;
    const baseHeight = this.canvas.height * 0.85 * this.zoom;

    const x = cx - baseWidth / 2 + normX * baseWidth;
    const y = cy - baseHeight / 2 + normY * baseHeight;

    return { x, y };
  }

  canvasToGeo(x, y) {
    const minLat = 21.0, maxLat = 23.5;
    const minLon = 87.5, maxLon = 92.0;
    const cx = this.canvas.width / 2 + this.panX;
    const cy = this.canvas.height / 2 + this.panY;
    const baseWidth = this.canvas.width * 0.85 * this.zoom;
    const baseHeight = this.canvas.height * 0.85 * this.zoom;

    const normX = (x - (cx - baseWidth / 2)) / baseWidth;
    const normY = (y - (cy - baseHeight / 2)) / baseHeight;

    const lon = minLon + normX * (maxLon - minLon);
    const lat = minLat + (1.0 - normY) * (maxLat - minLat);
    return { lat, lon };
  }

  handleMapHover(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let found = null;
    for (const asset of this.infrastructureAssets) {
      const pos = this.geoToCanvas(asset.lat, asset.lon);
      const dist = Math.hypot(pos.x - mouseX, pos.y - mouseY);
      if (dist < 14) {
        found = { asset, x: e.clientX, y: e.clientY };
        break;
      }
    }

    if (found) {
      this.hoveredAsset = found.asset;
      this.showTooltip(found);
    } else {
      this.hoveredAsset = null;
      this.hideTooltip();
    }
  }

  showTooltip({ asset, x, y }) {
    if (!this.tooltip) return;
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = `${x + 14}px`;
    this.tooltip.style.top = `${y + 14}px`;

    const statusColor = asset.isCritical ? '#ef4444' : (asset.isFlooded ? '#f59e0b' : '#10b981');

    this.tooltip.innerHTML = `
      <div style="font-weight: 700; color: #f8fafc; margin-bottom: 4px;">${asset.name}</div>
      <div style="font-size: 0.68rem; font-family: monospace; color: #94a3b8;">ID: ${asset.id} | Elev: ${asset.elevationM}m</div>
      <div style="display: flex; align-items: center; gap: 6px; margin: 6px 0;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${statusColor};"></span>
        <span style="font-size: 0.72rem; font-weight: 600; color: ${statusColor};">${asset.status}</span>
      </div>
      <div style="font-size: 0.7rem; color: #38bdf8;">Surge Depth: <strong>${asset.waterDepthM}m</strong></div>
      <div style="font-size: 0.68rem; color: #e2e8f0; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
        Action: <em>${asset.actionNeeded}</em>
      </div>
    `;
  }

  hideTooltip() {
    if (this.tooltip) this.tooltip.style.display = 'none';
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

    // 1. Draw Ocean Basemap & Coastal Landmass
    this.drawBasemap();

    // 2. Draw PINN Hydrodynamic Surge Inundation Footprint
    if (this.layers.surgeContours) {
      this.drawSurgeContours();
    }

    // 3. Draw Sentinel-1 SAR Otsu Change Footprint
    if (this.layers.sarInundation) {
      this.drawSARFootprint();
    }

    // 4. Draw Cyclone Track & Projected Cone of Uncertainty
    if (this.layers.stormTrack) {
      this.drawStormTrack();
    }

    // 5. Draw LoRaWAN Mesh Nodes & Links
    if (this.layers.loraMesh) {
      this.drawLoRaNodes();
    }

    // 6. Draw OSM Critical Infrastructure Nodes
    if (this.layers.osmInfrastructure) {
      this.drawInfrastructureNodes();
    }
  }

  drawBasemap() {
    const { ctx } = this;

    // Ocean Fill (Deep Navy)
    ctx.fillStyle = "#070c18";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid Lines (Lat / Lon)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let lat = 21.0; lat <= 23.5; lat += 0.5) {
      const p1 = this.geoToCanvas(lat, 87.5);
      const p2 = this.geoToCanvas(lat, 92.0);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    for (let lon = 88.0; lon <= 92.0; lon += 0.5) {
      const p1 = this.geoToCanvas(21.0, lon);
      const p2 = this.geoToCanvas(23.5, lon);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Coastal Outline Points: Bengal Delta, Sundarbans, Meghna Estuary
    const coastPoints = [
      { lat: 23.5, lon: 87.5 },
      { lat: 22.8, lon: 88.2 },
      { lat: 22.3, lon: 88.8 }, // Sundarbans West
      { lat: 21.8, lon: 89.2 }, // Sundarbans Coast
      { lat: 21.85, lon: 89.7 }, // Passur River Estuary
      { lat: 21.80, lon: 90.1 }, // Kuakata Beach
      { lat: 22.10, lon: 90.5 }, // Patuakhali / Meghna mouth
      { lat: 22.60, lon: 90.7 }, // Barisal inland
      { lat: 22.20, lon: 91.0 }, // Bhola Island
      { lat: 22.40, lon: 91.4 }, // Chittagong coast
      { lat: 21.80, lon: 91.8 }, // Cox's Bazar coast
      { lat: 21.00, lon: 92.2 },
      { lat: 23.5, lon: 92.0 }
    ];

    // Landmass Fill (Dark Slate)
    ctx.beginPath();
    coastPoints.forEach((pt, i) => {
      const p = this.geoToCanvas(pt.lat, pt.lon);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = "#0f172a";
    ctx.fill();

    // Coastline Boundary Stroke (Glowing Cyan Accent)
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Geographic Region Labels
    ctx.font = "10px 'Outfit', sans-serif";
    ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
    const lbl1 = this.geoToCanvas(22.2, 89.1);
    ctx.fillText("Sundarbans Mangrove Reserve", lbl1.x, lbl1.y);
    const lbl2 = this.geoToCanvas(21.4, 89.8);
    ctx.fillText("Bay of Bengal (Northern Sector)", lbl2.x, lbl2.y);
    const lbl3 = this.geoToCanvas(22.8, 90.3);
    ctx.fillText("Barisal Division", lbl3.x, lbl3.y);
  }

  drawSurgeContours() {
    const { ctx } = this;
    const depth = this.surgeDepthMeters;

    // Draw multi-ring hydrodynamic surge envelope centered around landfall zone
    const center = this.geoToCanvas(21.9, 90.0);
    const maxRadius = (depth / 4.8) * 160 * this.zoom;

    // Gradient Ramp from deep danger to outer pluvial reach
    const grad = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, maxRadius);
    grad.addColorStop(0, "rgba(239, 68, 68, 0.45)"); // Core > 3.5m surge
    grad.addColorStop(0.35, "rgba(245, 158, 11, 0.35)"); // 2.5m - 3.5m surge
    grad.addColorStop(0.7, "rgba(59, 130, 246, 0.25)"); // 1.5m - 2.5m surge
    grad.addColorStop(1, "rgba(56, 189, 248, 0.0)"); // 0.5m boundary

    ctx.beginPath();
    ctx.arc(center.x, center.y, maxRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Dynamic Iso-depth contour lines
    [0.35, 0.7, 1.0].forEach((ratio, i) => {
      ctx.beginPath();
      ctx.arc(center.x, center.y, maxRadius * ratio, 0, Math.PI * 2);
      ctx.strokeStyle = i === 0 ? "rgba(239, 68, 68, 0.6)" : (i === 1 ? "rgba(245, 158, 11, 0.5)" : "rgba(56, 189, 248, 0.4)");
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  drawSARFootprint() {
    const { ctx } = this;
    // Speckled radar water footprint along river channels
    const floodedWaterways = [
      [{ lat: 21.9, lon: 89.8 }, { lat: 22.3, lon: 89.9 }, { lat: 22.6, lon: 90.1 }],
      [{ lat: 21.85, lon: 90.2 }, { lat: 22.2, lon: 90.3 }, { lat: 22.5, lon: 90.4 }]
    ];

    ctx.lineWidth = 6 * this.zoom;
    ctx.strokeStyle = "rgba(0, 242, 254, 0.3)";
    floodedWaterways.forEach(channel => {
      ctx.beginPath();
      channel.forEach((pt, i) => {
        const p = this.geoToCanvas(pt.lat, pt.lon);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    });
  }

  drawStormTrack() {
    const { ctx } = this;
    // Storm Eye Track Coordinates from -120h to Landfall
    const track = [
      { step: "-120h", lat: 20.2, lon: 88.6 },
      { step: "-96h",  lat: 20.8, lon: 89.1 },
      { step: "-72h",  lat: 21.4, lon: 89.6 }, // ★ TRIGGER POINT
      { step: "-48h",  lat: 21.9, lon: 90.0 },
      { step: "-24h",  lat: 22.3, lon: 90.3 },
      { step: "0h",    lat: 22.7, lon: 90.6 }
    ];

    // Draw Cone of Uncertainty
    const pStart = this.geoToCanvas(track[0].lat, track[0].lon);
    const pEnd = this.geoToCanvas(track[track.length - 1].lat, track[track.length - 1].lon);

    ctx.beginPath();
    ctx.moveTo(pStart.x, pStart.y);
    ctx.lineTo(pEnd.x + 50 * this.zoom, pEnd.y);
    ctx.lineTo(pEnd.x - 50 * this.zoom, pEnd.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(239, 68, 68, 0.08)";
    ctx.fill();

    // Draw Track Line
    ctx.beginPath();
    track.forEach((pt, i) => {
      const p = this.geoToCanvas(pt.lat, pt.lon);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw Track Nodes & Current Eye Position
    const stepIdxMap = { "-120h": 0, "-96h": 1, "-72h": 2, "-48h": 3, "-24h": 4, "0h": 5 };
    const curIdx = stepIdxMap[this.currentTimelineStep] || 2;
    const currentEye = track[curIdx];
    const eyeCanvas = this.geoToCanvas(currentEye.lat, currentEye.lon);

    track.forEach((pt, i) => {
      const p = this.geoToCanvas(pt.lat, pt.lon);
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === curIdx ? 7 : 4, 0, Math.PI * 2);
      ctx.fillStyle = i === 2 ? "#f59e0b" : "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (i === 2) {
        ctx.font = "8px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#f59e0b";
        ctx.fillText("★ T-72H TRIGGER", p.x + 10, p.y - 4);
      }
    });

    // Swirling Animated Eye Vortex
    ctx.save();
    ctx.translate(eyeCanvas.x, eyeCanvas.y);
    ctx.beginPath();
    ctx.arc(0, 0, 18 * this.zoom, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 8 * this.zoom, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
    ctx.restore();
  }

  drawInfrastructureNodes() {
    const { ctx } = this;

    this.infrastructureAssets.forEach(asset => {
      const p = this.geoToCanvas(asset.lat, asset.lon);
      const isCritical = asset.isCritical;
      const isFlooded = asset.isFlooded;

      // Color Coding
      let fillColor = "#10b981"; // Operational (Emerald)
      if (isCritical) fillColor = "#ef4444"; // Severe (Red)
      else if (isFlooded) fillColor = "#f59e0b"; // Warning (Amber)

      // Outer Alert Glow for flooded facilities
      if (isFlooded) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14 * this.zoom, 0, Math.PI * 2);
        ctx.fillStyle = isCritical ? "rgba(239, 68, 68, 0.35)" : "rgba(245, 158, 11, 0.25)";
        ctx.fill();
      }

      // Marker Shape
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6 * this.zoom, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Icon Representation
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#ffffff";
      let icon = "•";
      if (asset.category === "medical_shelter") icon = "✚";
      else if (asset.category === "power_grid") icon = "⚡";
      else if (asset.category === "evacuation_route") icon = "═";
      else if (asset.category === "emergency_hub") icon = "★";
      ctx.fillText(icon, p.x - 3, p.y + 3);
    });
  }

  drawLoRaNodes() {
    const { ctx } = this;
    const loraPoints = [
      { lat: 22.70, lon: 90.37 },
      { lat: 22.35, lon: 90.33 },
      { lat: 22.05, lon: 90.22 },
      { lat: 21.82, lon: 90.12 }
    ];

    // Draw radio coverage ripples
    loraPoints.forEach((pt, i) => {
      const p = this.geoToCanvas(pt.lat, pt.lon);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 22 * this.zoom, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 229, 163, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }
}
