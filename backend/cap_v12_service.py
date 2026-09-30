"""
Tier 5: Common Alerting Protocol (CAP v1.2) Generator
Produces OASIS CAP v1.2 compliant XML and JSON-LD payloads for governmental Cell Broadcast Systems (CBS).
Includes compact byte-serialization for LoRaWAN offline mesh propagation.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List

class CAPAlertService:
    def __init__(self, sender_id: str = "wmo-anticipatory-action@cyclone.gov"):
        self.sender_id = sender_id

    def generate_cap_json_ld(self, gemini_cap_params: Dict[str, Any], polygon_coords: List[List[float]]) -> Dict[str, Any]:
        """
        Builds OASIS CAP v1.2 JSON-LD message.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        alert_id = f"urn:oid:2.49.0.0.50.0.2026.{uuid.uuid4().hex[:8]}"

        # Flatten polygon for CAP standard string representation "lat,lon lat,lon ..."
        polygon_str = " ".join([f"{coord[0]},{coord[1]}" for coord in polygon_coords])

        return {
            "@context": "http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2.jsonld",
            "identifier": alert_id,
            "sender": self.sender_id,
            "sent": now_iso,
            "status": "Actual",
            "msgType": gemini_cap_params.get("msgType", "Alert"),
            "scope": "Public",
            "info": [
                {
                    "category": [gemini_cap_params.get("category", "Met")],
                    "event": "Tropical Cyclone Anticipatory Emergency",
                    "urgency": gemini_cap_params.get("urgency", "Immediate"),
                    "severity": gemini_cap_params.get("severity", "Extreme"),
                    "certainty": "Observed",
                    "headline": gemini_cap_params.get("headline", "ANTICIPATORY CYCLONE ALERT"),
                    "description": gemini_cap_params.get("description", ""),
                    "instruction": gemini_cap_params.get("instruction", ""),
                    "area": [
                        {
                            "areaDesc": "Bay of Bengal Coastal Lowland Zone",
                            "polygon": polygon_str
                        }
                    ],
                    "parameter": [
                        {"valueName": "CellBroadcastService", "value": "Channel-4370"},
                        {"valueName": "ParametricTriggerStatus", "value": "ESCROW_EXECUTED"}
                    ]
                }
            ]
        }

    def generate_cap_xml(self, cap_json: Dict[str, Any]) -> str:
        """Converts CAP structure into strict XML for legacy civil protection broadcasts."""
        info = cap_json["info"][0]
        area = info["area"][0]
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>{cap_json['identifier']}</identifier>
  <sender>{cap_json['sender']}</sender>
  <sent>{cap_json['sent']}</sent>
  <status>{cap_json['status']}</status>
  <msgType>{cap_json['msgType']}</msgType>
  <scope>{cap_json['scope']}</scope>
  <info>
    <category>{info['category'][0]}</category>
    <event>{info['event']}</event>
    <urgency>{info['urgency']}</urgency>
    <severity>{info['severity']}</severity>
    <certainty>{info['certainty']}</certainty>
    <headline>{info['headline']}</headline>
    <description>{info['description']}</description>
    <instruction>{info['instruction']}</instruction>
    <area>
      <areaDesc>{area['areaDesc']}</areaDesc>
      <polygon>{area['polygon']}</polygon>
    </area>
  </info>
</alert>"""

    def compress_for_lorawan(self, cap_json: Dict[str, Any]) -> bytes:
        """
        Packs vital alert codes into ultra-compact binary packet (< 51 bytes) for LoRaWAN spreading factor 12.
        """
        # [1 byte msgType] [1 byte severity] [4 bytes unix timestamp] [2 bytes surge cm]
        msg_type_code = 1 if cap_json["msgType"] == "Alert" else 2
        severity_code = 4 # Extreme
        timestamp_int = int(datetime.now(timezone.utc).timestamp())
        surge_cm = 320 # 3.2m
        
        packet = bytearray()
        packet.append(msg_type_code)
        packet.append(severity_code)
        packet.extend(timestamp_int.to_bytes(4, byteorder="big"))
        packet.extend(surge_cm.to_bytes(2, byteorder="big"))
        return bytes(packet)

if __name__ == "__main__":
    service = CAPAlertService()
    cap = service.generate_cap_json_ld({
        "msgType": "Alert",
        "category": "Met",
        "urgency": "Immediate",
        "severity": "Extreme",
        "headline": "ANTICIPATORY CYCLONE ALERT (T-72H)",
        "description": "Massive coastal inundation projected.",
        "instruction": "Evacuate to cyclone shelters immediately."
    }, [[21.8, 89.2], [22.4, 90.1], [21.9, 90.8], [21.8, 89.2]])
    print(service.generate_cap_xml(cap))
