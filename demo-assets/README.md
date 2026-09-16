# ASTRA Demo Assets

This directory contains standalone testing assets and scripts for demonstration of the **ASTRA Mobile Urban Intelligence Platform (SIH26124)**:

1. **`sample-video.mp4`**:
   - A synthetic dashcam driving video featuring moving vehicles, Indian license plates (`AP 16 Z 4091`), and lane markers.
   - Can be uploaded directly into the **Onboard AI Detection** page to demonstrate video object detection and ANPR inspection.

2. **`sample-video-generator.py`**:
   - Python OpenCV script that generates the `sample-video.mp4` file.

3. **`route-simulator.py`**:
   - Standalone CLI Python script that connects to the ASTRA FastAPI backend, prints live telemetry for all 5 buses, triggers a simulated live Hit & Run incident, and logs a pothole recurrence detection.
   - Run with:
     ```bash
     python route-simulator.py
     ```
