/**
 * Tier 1: Google Earth Engine & Sentinel-1 SAR Pipeline Simulation
 * Handles radar backscatter histogram, dynamic Otsu thresholding,
 * and Copernicus DEM slope / HAND plausibility masking.
 */

export class GEEPipelineManager {
  constructor() {
    this.speckleFilterEnabled = true;
    this.demSlopeMaskEnabled = true;
    this.handMaskEnabled = true;
    this.jrcWaterMaskEnabled = true;
    this.currentThresholdDb = -6.5; // Calculated Otsu threshold
    this.histogramData = this.generateSyntheticSARHistogram();
  }

  generateSyntheticSARHistogram() {
    // Generate bimodal distribution: specular dark water drop vs rough terrain
    const bins = [];
    const count = 50;
    const minDb = -16.0;
    const maxDb = 4.0;
    const step = (maxDb - minDb) / count;

    for (let i = 0; i < count; i++) {
      const db = minDb + i * step;
      // Peak 1: Flooded specular water reflection (~ -8.5 dB)
      const waterPeak = 3800 * Math.exp(-0.5 * Math.pow((db - (-8.5)) / 1.6, 2));
      // Peak 2: Non-flooded land / urban vegetation (~ -0.5 dB)
      const landPeak = 9500 * Math.exp(-0.5 * Math.pow((db - (-0.5)) / 2.2, 2));
      bins.push({ db: parseFloat(db.toFixed(1)), frequency: Math.round(waterPeak + landPeak) });
    }
    return bins;
  }

  calculateOtsuThreshold() {
    let total = 0;
    let sum = 0;
    for (let i = 0; i < this.histogramData.length; i++) {
      total += this.histogramData[i].frequency;
      sum += i * this.histogramData[i].frequency;
    }

    let sumB = 0;
    let wB = 0;
    let maxVariance = 0;
    let optimalIndex = 0;

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
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = canvas.parentElement.clientHeight || 120;

    ctx.clearRect(0, 0, width, height);

    const maxFreq = Math.max(...this.histogramData.map(b => b.frequency));
    const barWidth = width / this.histogramData.length;

    // Draw Histogram Bars
    for (let i = 0; i < this.histogramData.length; i++) {
      const bin = this.histogramData[i];
      const barHeight = (bin.frequency / maxFreq) * (height - 24);
      const x = i * barWidth;
      const y = height - barHeight - 4;

      if (bin.db <= this.currentThresholdDb) {
        // Class: "New Water" specular reflection (Cyan/Blue)
        ctx.fillStyle = "rgba(0, 242, 254, 0.75)";
      } else {
        // Class: Land / Terrain (Dark Slate)
        ctx.fillStyle = "rgba(51, 65, 85, 0.6)";
      }
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }

    // Draw Otsu Threshold Line
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

    // Draw Text Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillText("Water Class (< -6.5dB)", 6, 14);
    ctx.fillText("Land / Non-flood", width - 96, 14);
  }
}
