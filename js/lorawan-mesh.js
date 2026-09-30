/**
 * Tier 5B: LoRaWAN Offline Mesh Network Simulator
 * Simulates decentralized emergency message propagation when cellular towers fail.
 */

import { LORAWAN_MESH_NODES } from './config.js';

export class LoRaMeshSimulator {
  constructor() {
    this.nodes = [...LORAWAN_MESH_NODES];
    this.packetsTransmitted = 142;
    this.activeHops = [];
  }

  transmitAlertPacket(compressedBytesCount = 38) {
    this.packetsTransmitted++;
    // Simulate hop sequence: Gateway -> Patuakhali -> Amtali -> Kuakata Shore
    this.activeHops = [
      { from: "lora_gw", to: "lora_n1", latencyMs: 180, rssi: -78 },
      { from: "lora_n1", to: "lora_n2", latencyMs: 240, rssi: -84 },
      { from: "lora_n2", to: "lora_n3", latencyMs: 310, rssi: -96 }
    ];

    return {
      packetSizeBytes: compressedBytesCount,
      spreadingFactor: 12,
      bandwidthKhz: 125,
      totalPropagationTimeMs: 730,
      hops: this.activeHops,
      deliverySuccessRate: "99.4%"
    };
  }

  renderMeshCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = canvas.parentElement.clientHeight || 130;

    ctx.clearRect(0, 0, width, height);

    // Positions for 5 nodes along coastal path
    const nodeCoords = [
      { id: "lora_gw", x: width * 0.15, y: height * 0.35, label: "GW (Barisal)" },
      { id: "lora_n1", x: width * 0.35, y: height * 0.65, label: "N1 (Patuakhali)" },
      { id: "lora_n2", x: width * 0.58, y: height * 0.45, label: "N2 (Amtali)" },
      { id: "lora_n3", x: width * 0.85, y: height * 0.70, label: "Siren (Kuakata)" },
      { id: "lora_n4", x: width * 0.45, y: height * 0.20, label: "N4 (Sundarbans)" }
    ];

    // Draw Links
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(0, 242, 254, 0.25)";

    const links = [
      [0, 1], [1, 2], [2, 3], [0, 4], [4, 1]
    ];

    links.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(nodeCoords[i].x, nodeCoords[i].y);
      ctx.lineTo(nodeCoords[j].x, nodeCoords[j].y);
      ctx.stroke();
    });

    // Draw Pulsing Nodes
    nodeCoords.forEach((node, i) => {
      // Glow
      ctx.beginPath();
      ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? "rgba(0, 242, 254, 0.2)" : (i === 3 ? "rgba(239, 68, 68, 0.2)" : "rgba(0, 229, 163, 0.2)");
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? "#00f2fe" : (i === 3 ? "#ef4444" : "#00e5a3");
      ctx.fill();

      // Label
      ctx.font = "8px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(node.label, node.x - 20, node.y - 12);
    });
  }
}
