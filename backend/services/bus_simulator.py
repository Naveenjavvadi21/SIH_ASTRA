import math
import random
from datetime import datetime

# Detailed coordinates for Vijayawada urban routes
ROUTES = {
    "ASTRA-101": {
        "name": "Central Corridor (PNBS - Benz Circle)",
        "plate": "AP 16 Z 4091",
        "waypoints": [
            (16.5182, 80.6190),  # PNBS Bus Terminal
            (16.5145, 80.6275),  # Governorpet
            (16.5098, 80.6380),  # Besant Road Jn
            (16.5074, 80.6482),  # Sub Collector Office
            (16.5035, 80.6558),  # DV Manor / MG Road
            (16.4998, 80.6625),  # Benz Circle Flyover
            (16.4950, 80.6720),  # Patamata
            (16.4910, 80.6835),  # Auto Nagar Gate
            (16.4950, 80.6720),  # Return leg
            (16.4998, 80.6625),
            (16.5074, 80.6482),
            (16.5182, 80.6190)
        ]
    },
    "ASTRA-102": {
        "name": "Prakasam Riverfront (Station - Tadepalli)",
        "plate": "AP 16 Z 5512",
        "waypoints": [
            (16.5185, 80.6199),  # Vijayawada Railway Station
            (16.5120, 80.6150),  # Kaleswara Rao Market
            (16.5085, 80.6080),  # Krishna Riverfront Road
            (16.5060, 80.6050),  # Prakasam Barrage North
            (16.4995, 80.6070),  # Prakasam Barrage South
            (16.4890, 80.6110),  # Tadepalli Jn
            (16.4780, 80.6145),  # Undavalli Approach
            (16.4890, 80.6110),
            (16.4995, 80.6070),
            (16.5085, 80.6080),
            (16.5185, 80.6199)
        ]
    },
    "ASTRA-103": {
        "name": "MG Road City Loop",
        "plate": "AP 37 AB 4821",
        "waypoints": [
            (16.5080, 80.6320),  # Old Bus Stand
            (16.5065, 80.6410),  # Lenin Center
            (16.5042, 80.6505),  # Tikle Road Jn
            (16.5015, 80.6590),  # Siddhartha College
            (16.4998, 80.6625),  # Benz Circle
            (16.5050, 80.6650),  # Ring Road North
            (16.5125, 80.6580),  # Jammi Chettu
            (16.5140, 80.6480),  # Governorpet East
            (16.5080, 80.6320)
        ]
    },
    "ASTRA-104": {
        "name": "Gunadala Heritage Line",
        "plate": "AP 16 TX 7780",
        "waypoints": [
            (16.5190, 80.6280),  # Eluru Road West
            (16.5220, 80.6370),  # Chuttugunta Circle
            (16.5245, 80.6475),  # Machavaram Down
            (16.5270, 80.6590),  # Gunadala Church Road
            (16.5250, 80.6680),  # Ramavarappadu Ring
            (16.5180, 80.6720),  # Prasadampadu
            (16.5250, 80.6680),
            (16.5270, 80.6590),
            (16.5220, 80.6370),
            (16.5190, 80.6280)
        ]
    },
    "ASTRA-105": {
        "name": "Amaravati NH-16 Link",
        "plate": "AP 16 Y 9923",
        "waypoints": [
            (16.4998, 80.6625),  # Benz Circle
            (16.4880, 80.6600),  # Mahanadu Road
            (16.4750, 80.6550),  # Kanuru Center
            (16.4620, 80.6500),  # Poranki
            (16.4520, 80.6450),  # Penamaluru
            (16.4620, 80.6500),
            (16.4750, 80.6550),
            (16.4880, 80.6600),
            (16.4998, 80.6625)
        ]
    }
}

def calculate_bearing(lat1, lon1, lat2, lon2):
    """Calculates compass heading (0-360 degrees) between two coordinates."""
    d_lon = math.radians(lon2 - lon1)
    y = math.sin(d_lon) * math.cos(math.radians(lat2))
    x = math.cos(math.radians(lat1)) * math.sin(math.radians(lat2)) - \
        math.sin(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.cos(d_lon)
    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360) % 360

class BusFleetSimulator:
    def __init__(self):
        self.buses = {}
        for bus_id, data in ROUTES.items():
            first_pt = data["waypoints"][0]
            second_pt = data["waypoints"][1]
            initial_heading = calculate_bearing(first_pt[0], first_pt[1], second_pt[0], second_pt[1])
            self.buses[bus_id] = {
                "id": bus_id,
                "route_name": data["name"],
                "plate_number": data["plate"],
                "status": "IN_TRANSIT",
                "current_waypoint_idx": 0,
                "segment_progress": 0.0,
                "step_size": random.uniform(0.04, 0.08),
                "lat": first_pt[0],
                "lng": first_pt[1],
                "heading": round(initial_heading, 1),
                "speed": round(random.uniform(26.0, 38.0), 1),
                "occupancy": random.randint(45, 82),
                "battery_or_fuel": random.randint(75, 96),
                "ai_status": "ACTIVE",
                "last_event": "Edge AI scanning active",
                "last_updated": datetime.utcnow().isoformat()
            }

    def step(self):
        """Advances each bus by one step along its route waypoints."""
        updated = []
        for bus_id, bus in self.buses.items():
            route = ROUTES[bus_id]["waypoints"]
            curr_idx = bus["current_waypoint_idx"]
            next_idx = (curr_idx + 1) % len(route)

            pt_a = route[curr_idx]
            pt_b = route[next_idx]

            # Advance progress along line segment
            bus["segment_progress"] += bus["step_size"]

            if bus["segment_progress"] >= 1.0:
                bus["segment_progress"] = 0.0
                bus["current_waypoint_idx"] = next_idx
                curr_idx = next_idx
                next_idx = (curr_idx + 1) % len(route)
                pt_a = route[curr_idx]
                pt_b = route[next_idx]
                # Small pause or speed variation at stops
                bus["speed"] = round(random.uniform(18.0, 36.0), 1)
                bus["occupancy"] = max(15, min(95, bus["occupancy"] + random.randint(-4, 6)))

            t = bus["segment_progress"]
            # Linear interpolation
            bus["lat"] = round(pt_a[0] + (pt_b[0] - pt_a[0]) * t, 6)
            bus["lng"] = round(pt_a[1] + (pt_b[1] - pt_a[1]) * t, 6)

            # Heading towards next point
            bus["heading"] = round(calculate_bearing(pt_a[0], pt_a[1], pt_b[0], pt_b[1]), 1)
            # Subtle realistic speed jitter
            speed_delta = random.uniform(-1.5, 1.5)
            bus["speed"] = max(15.0, min(55.0, round(bus["speed"] + speed_delta, 1)))
            bus["last_updated"] = datetime.utcnow().isoformat()

            # Random status simulation
            if bus["speed"] < 5:
                bus["status"] = "AT_STOP"
            else:
                bus["status"] = "IN_TRANSIT"

            updated.append(dict(bus))

        return updated

bus_fleet_simulator = BusFleetSimulator()
