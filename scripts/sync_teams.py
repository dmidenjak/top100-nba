"""
Fetches franchise accolades (league/conference/division titles, playoff
appearances, all-time record) and retired jersey numbers into data/teams.json.
FranchiseHistory covers every franchise in one request; TeamDetails is called
once per team (throttled) for the retired numbers.

    python scripts/sync_teams.py      (or: npm run sync:teams)
"""
import json
import sys
import time
from pathlib import Path

from nba_api.stats.endpoints import franchisehistory, franchiseleaders, teamdetails

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "teams.json"
STATS = ROOT / "data" / "stats.json"


def nba_id_to_slug() -> dict[int, str]:
    """Map nba player ids -> our player slugs, so leaders can link to pages."""
    try:
        snapshot = json.loads(STATS.read_text(encoding="utf-8"))
        return {e["nbaId"]: slug for slug, e in snapshot.items() if e.get("nbaId")}
    except Exception:  # noqa: BLE001
        return {}


def fetch_leaders(team_id: str, slug_by_id: dict[int, str]) -> dict:
    """Franchise all-time leaders (career totals with the franchise)."""
    rows = franchiseleaders.FranchiseLeaders(team_id=team_id, timeout=30).get_normalized_dict()[
        "FranchiseLeaders"
    ]
    r = rows[0] if rows else {}
    out = {}
    for key, label in (("PTS", "pts"), ("REB", "reb"), ("AST", "ast"), ("STL", "stl"), ("BLK", "blk")):
        if r.get(key) is not None:
            out[label] = {
                "player": r.get(f"{key}_PLAYER"),
                "value": r.get(key),
                "slug": slug_by_id.get(r.get(f"{key}_PERSON_ID")),
            }
    return out


def jersey_sort_key(r: dict):
    """Numbers first in numeric order, non-numeric honorees (broadcasters,
    coaches) last."""
    j = (r.get("jersey") or "").strip()
    return (0, int(j)) if j.isdigit() else (1, 0)


def fetch_retired(team_id: str) -> list[dict]:
    rows = teamdetails.TeamDetails(team_id=team_id, timeout=30).get_normalized_dict().get(
        "TeamRetired", []
    )
    out = [
        {
            "jersey": (r.get("JERSEY") or "").strip() or None,
            "player": r.get("PLAYER"),
            "position": r.get("POSITION"),
            "seasons": r.get("SEASONSWITHTEAM"),
            "year": r.get("YEAR"),
        }
        for r in rows
    ]
    return sorted(out, key=jersey_sort_key)


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:  # noqa: BLE001
        pass

    rows = franchisehistory.FranchiseHistory(timeout=30).get_normalized_dict()[
        "FranchiseHistory"
    ]

    # The endpoint lists one row per franchise era (e.g. Minneapolis Lakers,
    # Los Angeles Lakers). The FIRST row per TEAM_ID is the consolidated
    # franchise total spanning all eras — that's the one we keep.
    out = {}
    for r in rows:
        tid = str(r["TEAM_ID"])
        if tid in out:
            continue
        out[tid] = {
            "founded": int(r["START_YEAR"]),
            "wins": r["WINS"],
            "losses": r["LOSSES"],
            "playoffApps": r["PO_APPEARANCES"],
            "divTitles": r["DIV_TITLES"],
            "confTitles": r["CONF_TITLES"],
            "titles": r["LEAGUE_TITLES"],
        }

    # Retired jersey numbers + franchise leaders, two calls per franchise.
    slug_by_id = nba_id_to_slug()
    for tid in out:
        try:
            out[tid]["retired"] = fetch_retired(tid)
            print(f"  ✓ retired numbers for {tid}: {len(out[tid]['retired'])}")
        except Exception as err:  # noqa: BLE001
            out[tid]["retired"] = []
            print(f"  ✗ retired numbers for {tid} — {err}")
        time.sleep(0.8)
        try:
            out[tid]["leaders"] = fetch_leaders(tid, slug_by_id)
            print(f"  ✓ franchise leaders for {tid}")
        except Exception as err:  # noqa: BLE001
            out[tid]["leaders"] = {}
            print(f"  ✗ franchise leaders for {tid} — {err}")
        time.sleep(0.8)

    OUT.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(f"✓ wrote {len(out)} franchises to {OUT}")


if __name__ == "__main__":
    main()
