/**
 * Tier 5A: Common Alerting Protocol (CAP v1.2) Dispatcher & CBS Siren Simulator
 * Generates OASIS CAP v1.2 XML & JSON-LD structures.
 * Features an authentic Web Audio API siren generator for Cell Broadcast simulation.
 */

export class CAPDispatcher {
  constructor() {
    this.audioContext = null;
    this.oscillator1 = null;
    this.oscillator2 = null;
    this.isPlayingAlert = false;
  }

  generateJSONLD(capParams, aoi) {
    const alertId = `urn:oid:2.49.0.0.50.0.2026.${Math.random().toString(16).substr(2, 8)}`;
    return {
      "@context": "http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2.jsonld",
      "identifier": alertId,
      "sender": "anticipatory-action-fbaa@cyclone.gov",
      "sent": new Date().toISOString(),
      "status": "Actual",
      "msgType": capParams.msgType || "Alert",
      "scope": "Public",
      "info": [
        {
          "category": [capParams.category || "Met"],
          "event": "Tropical Cyclone Anticipatory Action Protocol",
          "urgency": capParams.urgency || "Immediate",
          "severity": capParams.severity || "Extreme",
          "certainty": "Observed",
          "headline": capParams.headline,
          "description": capParams.description,
          "instruction": capParams.instruction,
          "area": [
            {
              "areaDesc": "Bay of Bengal Coastal Sector (Sundarbans to Patuakhali)",
              "polygon": "21.8,89.2 22.4,90.1 21.9,90.8 21.8,89.2"
            }
          ]
        }
      ]
    };
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

  playEmergencySiren(durationSeconds = 3) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();

      // Standard Emergency Alert System (EAS) dual frequencies: 853 Hz & 960 Hz
      this.oscillator1 = this.audioContext.createOscillator();
      this.oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      this.oscillator1.type = "sine";
      this.oscillator1.frequency.setValueAtTime(853, this.audioContext.currentTime);

      this.oscillator2.type = "sine";
      this.oscillator2.frequency.setValueAtTime(960, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);

      this.oscillator1.connect(gainNode);
      this.oscillator2.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      this.oscillator1.start();
      this.oscillator2.start();
      this.isPlayingAlert = true;

      setTimeout(() => {
        this.stopEmergencySiren();
      }, durationSeconds * 1000);
    } catch (e) {
      console.warn("Audio playback not allowed without prior user interaction:", e);
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
    this.isPlayingAlert = false;
  }
}
