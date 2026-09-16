import random
import time
from typing import Optional, Dict, Any

DEFECT_CATEGORIES = [
    {
        "type": "pothole",
        "label": "Road Pothole (Depth ~8cm)",
        "color": "#f97316",  # Orange
        "base_severity": "HIGH",
        "default_box": [0.65, 0.35, 0.85, 0.62]
    },
    {
        "type": "waterlogging",
        "label": "Surface Waterlogging (Spread ~12m)",
        "color": "#0284c7",  # Blue
        "base_severity": "MEDIUM",
        "default_box": [0.55, 0.20, 0.90, 0.80]
    },
    {
        "type": "missing_signage",
        "label": "Damaged/Missing Speed Sign",
        "color": "#eab308",  # Yellow
        "base_severity": "LOW",
        "default_box": [0.15, 0.75, 0.40, 0.92]
    }
]

class DefectDetector:
    def __init__(self):
        self.last_detection_time = time.time()

    def inspect_frame(self, simulate_trigger: bool = False, force_type: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Simulates road defect detection on road camera frame.
        Can be forced or randomly triggered for live edge demonstrations.
        """
        now = time.time()
        # If forced or random trigger
        if simulate_trigger or (now - self.last_detection_time > 20 and random.random() < 0.3):
            self.last_detection_time = now

            if force_type:
                selected = next((d for d in DEFECT_CATEGORIES if d["type"] == force_type), DEFECT_CATEGORIES[0])
            else:
                selected = random.choice(DEFECT_CATEGORIES)

            conf = round(random.uniform(0.88, 0.97), 2)
            # Add small random jitter to bounding box
            jitter = [random.uniform(-0.02, 0.02) for _ in range(4)]
            box = [
                max(0.05, min(0.95, selected["default_box"][0] + jitter[0])),
                max(0.05, min(0.95, selected["default_box"][1] + jitter[1])),
                max(0.05, min(0.95, selected["default_box"][2] + jitter[2])),
                max(0.05, min(0.95, selected["default_box"][3] + jitter[3]))
            ]

            return {
                "detected": True,
                "type": selected["type"],
                "label": selected["label"],
                "color": selected["color"],
                "severity": selected["base_severity"],
                "confidence": conf,
                "bbox": box
            }

        return None

defect_detector = DefectDetector()
