"""
export_france_geojson.py
========================
Exports the EMEA_France_26 field boundaries from GEE as a simplified GeoJSON
file suitable for serving in the frontend map (public/france_boundaries.geojson).

Simplifies geometries to reduce file size — keeps ~5 m precision.

Usage:
    python scripts/export_france_geojson.py
"""
import json
import os
import sys

try:
    import ee
except ImportError:
    sys.exit("Run: pip install earthengine-api")

ASSET_ID   = "projects/gen-lang-client-0499108456/assets/EMEA_France_26"
GEE_PROJECT = "gen-lang-client-0499108456"
OUT_PATH   = os.path.join(os.path.dirname(__file__), "..", "public", "france_boundaries.geojson")

# Approximate bounding box for the Loire riparian corridor
FRANCE_AOI = (-1.0, 46.8, 0.8, 48.2)   # lon_min, lat_min, lon_max, lat_max

def run():
    print("Initialising Earth Engine …")
    try:
        ee.Initialize(project=GEE_PROJECT)
    except Exception as exc:
        sys.exit(f"GEE init failed: {exc}")

    print("Loading asset …")
    fields = ee.FeatureCollection(ASSET_ID)

    print("Fetching feature count …")
    count = fields.size().getInfo()
    print(f"  {count} features in asset")

    # Simplify to 10 m tolerance to keep file size reasonable
    simplified = fields.map(
        lambda f: f.simplify(maxError=10).setGeometry(
            f.geometry().simplify(maxError=10)
        )
    )

    print("Downloading GeoJSON … (may take a minute for 2000+ features)")
    geojson = simplified.getInfo()   # returns a GeoJSON FeatureCollection dict

    # Strip heavy system:index and other GEE metadata from properties
    kept_props = {"unit_id", "Unit_ID", "UNIT_ID", "id", "ID", "FID",
                  "area_ha", "Area_ha", "name", "Name"}
    cleaned_features = []
    for i, feat in enumerate(geojson.get("features", [])):
        props = feat.get("properties") or {}
        unit_id = (
            props.get("unit_id") or props.get("Unit_ID") or props.get("UNIT_ID")
            or props.get("id") or props.get("ID") or props.get("FID")
            or f"FR-{i+1:04d}"
        )
        cleaned_features.append({
            "type": "Feature",
            "properties": {"unit_id": str(unit_id)},
            "geometry": feat.get("geometry"),
        })

    output = {"type": "FeatureCollection", "features": cleaned_features}

    out_path = os.path.normpath(OUT_PATH)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, separators=(",", ":"))

    size_kb = os.path.getsize(out_path) / 1024
    print(f"\nWritten {len(cleaned_features)} features → {out_path}")
    print(f"File size: {size_kb:.0f} KB")
    if size_kb > 5000:
        print("WARNING: File is large (>5 MB). Consider using GEE map tiles instead.")

if __name__ == "__main__":
    run()
