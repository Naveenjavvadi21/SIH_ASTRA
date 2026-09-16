import random
from typing import Optional, Dict, Any

INDIAN_PLATES = [
    "AP 37 AB 4821",
    "AP 16 Z 5512",
    "AP 16 TX 7780",
    "AP 16 Y 9923",
    "AP 16 CQ 3410",
    "TS 09 UB 1042",
    "AP 39 BK 6729",
    "AP 07 BL 8192"
]

VIOLATION_TYPES = [
    {"type": "HIT_AND_RUN", "title": "Hit & Run Collision with Cyclist", "severity": "CRITICAL"},
    {"type": "ILLEGAL_PARKING", "title": "Bus Rapid Transit Corridor Obstruction", "severity": "HIGH"},
    {"type": "RECKLESS_DRIVING", "title": "Dangerous Overtaking & Lane Cutting", "severity": "HIGH"}
]

class ANPRSimulator:
    def __init__(self):
        self.plate_pool = INDIAN_PLATES

    def scan_plate(self, force_violation: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Simulates ANPR plate recognition and infraction detection on vehicle box.
        """
        plate = random.choice(self.plate_pool)
        conf = round(random.uniform(0.91, 0.98), 3)

        if force_violation:
            viol = next((v for v in VIOLATION_TYPES if v["type"] == force_violation), VIOLATION_TYPES[0])
            return {
                "plate": plate,
                "confidence": conf,
                "violation": viol,
                "bbox": [0.45, 0.40, 0.58, 0.60]
            }

        # 20% probability of an infraction detection during frame scan
        if random.random() < 0.20:
            viol = random.choice(VIOLATION_TYPES)
            return {
                "plate": plate,
                "confidence": conf,
                "violation": viol,
                "bbox": [0.45, 0.40, 0.58, 0.60]
            }

        return {
            "plate": plate,
            "confidence": conf,
            "violation": None,
            "bbox": [0.45, 0.40, 0.58, 0.60]
        }

anpr_simulator = ANPRSimulator()
