"""
clean_supabase.py
=================
Removes all demo/duplicate projects from Supabase, keeping only the most
recent 'Loire Riparian Restoration' project that has real GEE data.

Usage:
    python scripts/clean_supabase.py
"""
import os
import sys

try:
    from supabase import create_client
except ImportError:
    sys.exit("Run: pip install supabase")

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

def run():
    url = os.environ.get("VITE_SUPABASE_URL", "")
    key = os.environ.get("VITE_SUPABASE_ANON_KEY", "")
    if not url or not key:
        sys.exit("ERROR: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env")

    sb = create_client(url, key)

    # Fetch all projects
    all_projects = sb.table("projects").select("id, name, status, updated_at, overall_cobenefit_score").order("updated_at", desc=True).execute()
    if not all_projects.data:
        print("No projects found in Supabase.")
        return

    print(f"Found {len(all_projects.data)} projects:")
    for p in all_projects.data:
        units = sb.table("spatial_units").select("id", count="exact").eq("project_id", p["id"]).execute()
        unit_count = units.count or 0
        print(f"  [{p['id'][:8]}] {p['name']} — score={p['overall_cobenefit_score']} status={p['status']} units={unit_count}")

    # Find the real France project: has the most spatial units
    france_projects = [p for p in all_projects.data if "Loire" in (p.get("name") or "")]
    if not france_projects:
        print("No Loire project found — nothing to do.")
        return

    # Pick the one with most spatial units (the real GEE data)
    best = None
    best_count = -1
    for p in france_projects:
        res = sb.table("spatial_units").select("id", count="exact").eq("project_id", p["id"]).execute()
        c = res.count or 0
        if c > best_count:
            best_count = c
            best = p

    print(f"\nKeeping: [{best['id'][:8]}] {best['name']} — {best_count} real GEE units")

    # Delete all other projects (cascade will remove spatial_units, qa_issues, etc.)
    delete_ids = [p["id"] for p in all_projects.data if p["id"] != best["id"]]
    if delete_ids:
        for pid in delete_ids:
            sb.table("projects").delete().eq("id", pid).execute()
        print(f"Deleted {len(delete_ids)} demo/duplicate projects")
    else:
        print("Nothing to delete.")

    print("\nDone. Only the real GEE project remains.")

if __name__ == "__main__":
    run()
