import os
import time
import logging
import cv2
import numpy as np

logger = logging.getLogger("yolo_detector")

CLASS_COLORS = {
    "person": "#10b981",      # Emerald green
    "car": "#2563eb",         # Royal Blue
    "bus": "#0891b2",         # Cyan
    "truck": "#7c3aed",       # Purple
    "motorcycle": "#d97706",  # Amber
    "bicycle": "#db2777"       # Pink
}

TARGET_CLASSES = ["person", "car", "bus", "truck", "motorcycle", "bicycle"]

class YOLODetector:
    def __init__(self):
        self.model = None
        self.is_ready = False
        self.model_name = "YOLOv11n (Ultralytics v11)"
        self._initialize_model()

    def _initialize_model(self):
        try:
            from ultralytics import YOLO
            logger.info("Initializing Ultralytics YOLOv11n...")
            # Load state-of-the-art YOLOv11 nano model
            self.model = YOLO("yolo11n.pt")
            self.is_ready = True
            logger.info("YOLOv11n model successfully loaded and ready for real-time edge inference.")
        except Exception as e:
            logger.error(f"Failed to load YOLOv11n model: {e}. Fallback to OpenCV detector.")
            self.is_ready = False

    def detect(self, image_np: np.ndarray, conf_threshold: float = 0.35):
        """
        Runs object detection on numpy image array (BGR or RGB) using YOLOv11n.
        Returns list of detections with normalized bounding boxes [ymin, xmin, ymax, xmax].
        """
        start_time = time.time()
        height, width = image_np.shape[:2]
        detections = []
        vehicle_count = 0
        pedestrian_count = 0

        if self.is_ready and self.model is not None:
            try:
                results = self.model(image_np, verbose=False, conf=conf_threshold)
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0].item())
                        cls_name = self.model.names[cls_id]
                        conf = float(box.conf[0].item())

                        if cls_name in TARGET_CLASSES:
                            x1, y1, x2, y2 = box.xyxy[0].tolist()
                            norm_box = [
                                max(0.0, min(1.0, y1 / height)),
                                max(0.0, min(1.0, x1 / width)),
                                max(0.0, min(1.0, y2 / height)),
                                max(0.0, min(1.0, x2 / width))
                            ]

                            color = CLASS_COLORS.get(cls_name, "#2563eb")
                            detections.append({
                                "bbox": norm_box,
                                "class_name": cls_name,
                                "confidence": round(conf, 3),
                                "color": color
                            })

                            if cls_name == "person":
                                pedestrian_count += 1
                            else:
                                vehicle_count += 1

                inference_time = (time.time() - start_time) * 1000
                return {
                    "detections": detections,
                    "vehicle_count": vehicle_count,
                    "pedestrian_count": pedestrian_count,
                    "inference_time_ms": round(inference_time, 2),
                    "engine": "YOLOv11n"
                }
            except Exception as e:
                logger.error(f"YOLOv11 inference error: {e}")

        # Fallback OpenCV contour & brightness heuristic detector
        return self._opencv_fallback_detect(image_np, start_time)

    def _opencv_fallback_detect(self, image_np: np.ndarray, start_time: float):
        """High-speed OpenCV fallback for lightweight edge detection."""
        height, width = image_np.shape[:2]
        gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY) if len(image_np.shape) == 3 else image_np
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        detections = []
        vehicle_count = 0
        pedestrian_count = 0

        for cnt in contours[:15]:
            x, y, w, h = cv2.boundingRect(cnt)
            area = w * h
            aspect_ratio = float(w) / max(1, h)

            if area < (width * height * 0.01) or area > (width * height * 0.5):
                continue

            if aspect_ratio < 0.6:
                cls_name = "person"
                pedestrian_count += 1
            elif aspect_ratio > 1.8:
                cls_name = "bus" if w > width * 0.4 else "car"
                vehicle_count += 1
            else:
                cls_name = "car"
                vehicle_count += 1

            norm_box = [
                round(y / height, 4),
                round(x / width, 4),
                round((y + h) / height, 4),
                round((x + w) / width, 4)
            ]

            detections.append({
                "bbox": norm_box,
                "class_name": cls_name,
                "confidence": round(0.82 + (area / (width * height)) * 0.15, 2),
                "color": CLASS_COLORS.get(cls_name, "#2563eb")
            })

        inference_time = (time.time() - start_time) * 1000
        return {
            "detections": detections,
            "vehicle_count": vehicle_count,
            "pedestrian_count": pedestrian_count,
            "inference_time_ms": round(inference_time, 2),
            "engine": "OpenCV-EdgeFallback"
        }

yolo_detector = YOLODetector()
