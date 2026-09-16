"""
ASTRA Route & Defect Simulator (Standalone CLI Utility)
Smart India Hackathon 2026 - SIH26124
"""
import sys
import time
import requests

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BACKEND_URL = "http://127.0.0.1:8000"

def main():
    print("==================================================")
    print("   ASTRA - Urban Intelligence Route Simulator     ")
    print("==================================================")
    print(f"Connecting to ASTRA Backend at: {BACKEND_URL}")

    try:
        r = requests.get(f"{BACKEND_URL}/")
        print("Backend Status:", r.json().get("status", "UNKNOWN"))
    except Exception as e:
        print(f"Could not reach backend: {e}")
        return

    print("\nFetching Live Fleet Telemetry...")
    buses = requests.get(f"{BACKEND_URL}/api/buses").json()
    for b in buses:
        print(f" • [{b['id']}] {b['route_name']} | Speed: {b['speed']} km/h | Occupancy: {b['occupancy']}% | Heading: {b['heading']}°")

    print("\nTriggering a simulated live Hit & Run incident...")
    alert_res = requests.post(f"{BACKEND_URL}/api/alerts/trigger", json={
        "type": "HIT_AND_RUN",
        "license_plate": "AP 37 AB 4821",
        "bus_id": "ASTRA-103",
        "location_name": "Benz Circle Flyover Underpass"
    }).json()
    alert_id = alert_res.get("alert", {}).get("id", "N/A")
    print(f"Alert Broadcasted: ID {alert_id} | Status: {alert_res.get('status')}")

    print("\nTriggering a simulated Pothole Defect scan...")
    defect_res = requests.post(f"{BACKEND_URL}/api/events/trigger-defect", json={
        "type": "pothole",
        "bus_id": "ASTRA-101",
        "address": "MG Road near DV Manor"
    }).json()
    action = defect_res.get("action")
    print(f"Defect Recorded: Action {action}")
    print("\nCheck the GIS Dashboard to see real-time updates!")

if __name__ == "__main__":
    main()
