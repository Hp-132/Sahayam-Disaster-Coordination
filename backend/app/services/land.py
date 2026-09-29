"""
Land-boundary validation for randomly generated demo coordinates.

Uses `global-land-mask` (bundled land/ocean raster, no network calls, fully
reproducible) instead of a hand-maintained polygon, so simulated coastal
incidents never end up in the sea.
"""
import random
from typing import Tuple

from global_land_mask import globe


def is_on_land(lat: float, lng: float) -> bool:
    """True if (lat, lng) falls on land anywhere on Earth."""
    return bool(globe.is_land(lat, lng))


def random_land_point_in_box(box: dict, max_attempts: int = 500) -> Tuple[float, float]:
    """
    Uniformly sample a (lat, lng) inside the given box, rejecting points that
    fall in the sea. Raises ValueError if no land point is found within
    max_attempts (e.g. the box is entirely open water).
    """
    for _ in range(max_attempts):
        lat = random.uniform(box["lat_min"], box["lat_max"])
        lng = random.uniform(box["lng_min"], box["lng_max"])
        if is_on_land(lat, lng):
            return lat, lng
    raise ValueError(
        f"Could not find a land point in box {box} after {max_attempts} attempts "
        "(box may be entirely at sea)"
    )


def random_land_point_near(
    lat: float, lng: float, spread: float = 0.04, max_attempts: int = 500
) -> Tuple[float, float]:
    """
    Sample a (lat, lng) within +/- spread degrees of an anchor point,
    rejecting sea points. If the anchor itself is on land and no offset
    point is found, falls back to the anchor. Widens the search radius a
    few times before giving up, so hotspots right at the coastline still
    resolve to a nearby land point.
    """
    for attempt_spread in (spread, spread * 2, spread * 4):
        for _ in range(max_attempts):
            cand_lat = lat + random.uniform(-attempt_spread, attempt_spread)
            cand_lng = lng + random.uniform(-attempt_spread, attempt_spread)
            if is_on_land(cand_lat, cand_lng):
                return cand_lat, cand_lng
    if is_on_land(lat, lng):
        return lat, lng
    raise ValueError(
        f"Could not find a land point near ({lat}, {lng}) within spread={spread} "
        f"after widening the search"
    )
