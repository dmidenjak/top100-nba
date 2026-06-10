"""
Fetches the NBA's official all-time top-10 leaders (points, rebounds, assists,
steals, blocks, threes, games) into data/records.json — one API call total.
Leaders who are in our Top 100 get their slug attached so the page can link.

    python scripts/sync_records.py      (or: npm run sync:records)
"""
import json
import sys
from pathlib import Path

from nba_api.stats.endpoints import alltimeleadersgrids

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "records.json"
STATS = ROOT / "data" / "stats.json"

CATEGORIES = [
    ("PTSLeaders", "PTS", "Points"),
    ("REBLeaders", "REB", "Rebounds"),
    ("ASTLeaders", "AST", "Assists"),
    ("STLLeaders", "STL", "Steals"),
    ("BLKLeaders", "BLK", "Blocks"),
    ("FG3MLeaders", "FG3M", "Three-pointers made"),
    ("GPLeaders", "GP", "Games played"),
]


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:  # noqa: BLE001
        pass

    snapshot = json.loads(STATS.read_text(encoding="utf-8"))
    slug_by_id = {e["nbaId"]: slug for slug, e in snapshot.items() if e.get("nbaId")}

    grids = alltimeleadersgrids.AllTimeLeadersGrids(topx=10, timeout=30).get_normalized_dict()

    out = []
    for grid_key, value_key, label in CATEGORIES:
        rows = grids.get(grid_key, [])
        out.append({
            "key": value_key.lower(),
            "label": label,
            "rows": [
                {
                    "rank": r.get(f"{value_key}_RANK"),
                    "name": r.get("PLAYER_NAME"),
                    "value": r.get(value_key),
                    "active": r.get("IS_ACTIVE_FLAG") == "Y",
                    "slug": slug_by_id.get(r.get("PLAYER_ID")),
                }
                for r in rows
            ],
        })

    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"✓ wrote {len(out)} record categories to {OUT}")


if __name__ == "__main__":
    main()
