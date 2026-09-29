"""
Tests for simulated-incident coordinate generation staying on land.

Run with:
    python -m unittest tests.test_land_validation -v
"""
import random
import unittest

from app.services.land import is_on_land, random_land_point_in_box, random_land_point_near

# The same rectangular zones used by seed.py -- these boxes straddle the
# Arabian Sea coastline, which is exactly why naive uniform sampling used to
# place incidents offshore.
ZONE_BOXES = {
    "Saurashtra-Diu": {"lat_min": 20.60, "lat_max": 22.50, "lng_min": 68.90, "lng_max": 71.80},
    "South Gujarat": {"lat_min": 20.00, "lat_max": 21.60, "lng_min": 72.60, "lng_max": 73.30},
    "Konkan": {"lat_min": 15.30, "lat_max": 19.50, "lng_min": 72.60, "lng_max": 73.80},
    "Southwest": {"lat_min": 8.00, "lat_max": 14.50, "lng_min": 74.60, "lng_max": 77.00},
}
OUTSIDE_BOX = {"lat_min": 18.0, "lat_max": 21.0, "lng_min": 76.5, "lng_max": 79.0}

ZONE_HOTSPOTS = {
    "Saurashtra-Diu": [(21.64, 69.61), (20.71, 70.98), (22.24, 68.97)],
    "South Gujarat": [(21.17, 72.83), (20.60, 72.93)],
    "Konkan": [(18.94, 72.83), (16.70, 73.30), (15.50, 73.80)],
    "Southwest": [(12.91, 74.85), (9.93, 76.26), (8.52, 76.94)],
}

# Known open-water points that a naive `random.uniform` box sample could
# produce and that must never be returned by the land-validated helpers.
KNOWN_SEA_POINTS = [
    (21.0, 69.3),   # Gulf of Kutch / Arabian Sea off Saurashtra
    (20.0, 66.0),   # deep Arabian Sea
    (18.9, 72.5),   # sea off Mumbai
    (9.5, 75.8),    # sea off Kerala
]

KNOWN_LAND_POINTS = [
    (21.6417, 69.6293),  # Porbandar
    (19.0760, 72.8777),  # Mumbai
    (9.9312, 76.2673),   # Kochi
]


class LandValidationTests(unittest.TestCase):
    def setUp(self):
        random.seed(42)  # matches the reproducible seed used by seed.py

    def test_known_sea_points_are_rejected(self):
        for lat, lng in KNOWN_SEA_POINTS:
            self.assertFalse(is_on_land(lat, lng), f"({lat}, {lng}) should be sea")

    def test_known_land_points_are_accepted(self):
        for lat, lng in KNOWN_LAND_POINTS:
            self.assertTrue(is_on_land(lat, lng), f"({lat}, {lng}) should be land")

    def test_random_points_in_zone_boxes_are_always_on_land(self):
        for name, box in ZONE_BOXES.items():
            for _ in range(100):
                lat, lng = random_land_point_in_box(box)
                self.assertTrue(is_on_land(lat, lng), f"{name}: ({lat}, {lng}) is at sea")
                self.assertTrue(box["lat_min"] <= lat <= box["lat_max"])
                self.assertTrue(box["lng_min"] <= lng <= box["lng_max"])

    def test_outside_zone_box_points_are_on_land(self):
        for _ in range(100):
            lat, lng = random_land_point_in_box(OUTSIDE_BOX)
            self.assertTrue(is_on_land(lat, lng))

    def test_hotspot_clusters_stay_on_land(self):
        for name, hotspots in ZONE_HOTSPOTS.items():
            for hlat, hlng in hotspots:
                for _ in range(20):
                    lat, lng = random_land_point_near(hlat, hlng, spread=0.04)
                    self.assertTrue(is_on_land(lat, lng), f"{name} hotspot ({hlat},{hlng}) -> ({lat},{lng}) at sea")

    def test_box_entirely_at_sea_raises(self):
        deep_sea_box = {"lat_min": 19.5, "lat_max": 20.5, "lng_min": 65.0, "lng_max": 66.0}
        with self.assertRaises(ValueError):
            random_land_point_in_box(deep_sea_box, max_attempts=50)


if __name__ == "__main__":
    unittest.main()
