"""
Fetches NBA career stats + metadata into the committed snapshot data/stats.json,
using the nba_api library (https://github.com/swar/nba_api), which wraps the
NBA's official stats.nba.com endpoints. Free, no API key, covers every era.

    pip install -r scripts/requirements.txt
    python scripts/sync_stats.py            # fill in missing players
    python scripts/sync_stats.py --force    # re-fetch everyone
    python scripts/sync_stats.py --limit 5  # only the first 5 (for testing)

The site reads ONLY data/stats.json, so the unofficial stats.nba.com API is
never hit at build or runtime. Player IDs are resolved from nba_api's bundled
static list (offline, no rate limit). Saves after every player, so it resumes
if interrupted.

Caveat: stats.nba.com is unofficial and may block some IPs / rate-limit; if a
request hangs or errors, just re-run (it resumes).
"""
import json
import re
import sys
import time
import unicodedata
from pathlib import Path

from nba_api.stats.static import players as static_players
from nba_api.stats.static import teams as static_teams
from nba_api.stats.endpoints import commonplayerinfo, playercareerstats, playerawards

# Franchise id -> current full name (e.g. 1610612747 -> "Los Angeles Lakers").
TEAM_BY_ID = {t["id"]: t["full_name"] for t in static_teams.get_teams()}
# Defunct franchises that aren't in the static list (and have no CDN logo).
TEAM_BY_ID.setdefault(1610610036, "Washington Capitols")

ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = ROOT / "content" / "players"
SNAPSHOT = ROOT / "data" / "stats.json"

FORCE = "--force" in sys.argv
LIMIT = next((int(a.split("=")[1]) for a in sys.argv if a.startswith("--limit=")), None)
if "--limit" in sys.argv:
    i = sys.argv.index("--limit")
    if i + 1 < len(sys.argv):
        LIMIT = int(sys.argv[i + 1])

# Manual slug -> nba_api player id overrides for names that don't match cleanly.
OVERRIDES: dict[str, int] = {
    "jimmy-butler": 202710,  # NBA lists him as "Jimmy Butler III"
}


def normalize(name: str) -> str:
    """Strip accents/punctuation, lowercase, collapse whitespace for matching."""
    n = unicodedata.normalize("NFD", name)
    n = "".join(c for c in n if unicodedata.category(c) != "Mn")
    n = re.sub(r"[^a-zA-Z0-9 ]", "", n).lower()
    return re.sub(r"\s+", " ", n).strip()


def read_players() -> list[tuple[str, str]]:
    """Return (slug, name) for every content/players/*.md file."""
    out = []
    for md in sorted(CONTENT_DIR.glob("*.md")):
        text = md.read_text(encoding="utf-8")
        m = re.search(r'^name:\s*"?([^"\n]+?)"?\s*$', text, re.MULTILINE)
        if m:
            out.append((md.stem, m.group(1).strip()))
    return out


# Build a normalized-name -> [ids] index from the offline static player list.
NAME_INDEX: dict[str, list[int]] = {}
for p in static_players.get_players():
    NAME_INDEX.setdefault(normalize(p["full_name"]), []).append(p["id"])


def resolve_id(slug: str, name: str) -> int | None:
    if slug in OVERRIDES:
        return OVERRIDES[slug]
    ids = NAME_INDEX.get(normalize(name))
    if not ids:
        return None
    if len(ids) > 1:
        print(f"    (ambiguous: {len(ids)} players named {name!r}; using first {ids[0]})")
    return ids[0]


def _row(season: str, r: dict) -> dict:
    """Full per-game season line. Percentages stay as fractions (0.497);
    the UI formats them. Stats the NBA didn't track yet (steals/blocks pre-1973,
    3-pointers pre-1979, …) come back as None and render as '—'."""
    return {
        "season": season,
        "team": r.get("TEAM_ABBREVIATION"),
        "age": r.get("PLAYER_AGE"),
        "gp": r.get("GP"),
        "gs": r.get("GS"),
        "min": r.get("MIN"),
        "ppg": r.get("PTS"),
        "rpg": r.get("REB"),
        "apg": r.get("AST"),
        "oreb": r.get("OREB"),
        "dreb": r.get("DREB"),
        "fgm": r.get("FGM"),
        "fga": r.get("FGA"),
        "fgPct": r.get("FG_PCT"),
        "tpm": r.get("FG3M"),
        "tpa": r.get("FG3A"),
        "tpPct": r.get("FG3_PCT"),
        "ftm": r.get("FTM"),
        "fta": r.get("FTA"),
        "ftPct": r.get("FT_PCT"),
        "stl": r.get("STL"),
        "blk": r.get("BLK"),
        "tov": r.get("TOV"),
        "pf": r.get("PF"),
    }


def per_game_rows(career: dict) -> list[dict]:
    """Map nba_api PerGame rows into our {season, gp, ppg, rpg, apg} shape.

    When a player was traded mid-season the API returns one row per team plus a
    combined 'TOT' row; we keep only the combined row so each season appears once.
    """
    by_season: dict[str, list[dict]] = {}
    for r in career.get("SeasonTotalsRegularSeason", []):
        by_season.setdefault(r["SEASON_ID"], []).append(r)

    rows = []
    for season_id, group in by_season.items():
        chosen = next((g for g in group if g.get("TEAM_ABBREVIATION") == "TOT"), group[-1])
        rows.append(_row(season_id, chosen))

    for r in career.get("CareerTotalsRegularSeason", []):
        rows.append(_row("Career", r))
    return rows


def teams_played(career: dict) -> list[dict]:
    """Franchises the player suited up for, in first-appearance order, with the
    season-year span per franchise. Traded seasons list per-team rows (plus a
    combined TOT row, which we skip), so both franchises are captured."""
    by_id: dict[int, dict] = {}
    for r in career.get("SeasonTotalsRegularSeason", []):
        tid = r.get("TEAM_ID")
        abbr = r.get("TEAM_ABBREVIATION")
        if not tid or abbr == "TOT":
            continue
        m = re.match(r"^(\d{4})", str(r.get("SEASON_ID", "")))
        if not m:
            continue
        year = int(m.group(1))
        entry = by_id.setdefault(tid, {
            "id": tid,
            "abbr": abbr,
            "name": TEAM_BY_ID.get(tid),
            "from": year,
            "to": year + 1,
        })
        entry["from"] = min(entry["from"], year)
        entry["to"] = max(entry["to"], year + 1)
        entry["abbr"] = abbr  # keep the most recent abbreviation
    return sorted(by_id.values(), key=lambda t: t["from"])


def aggregate_awards(rows: list[dict]) -> dict:
    """Count the accolades we care about from PlayerAwards rows."""
    a = {
        "championships": 0,
        "mvp": 0,
        "finalsMvp": 0,
        "dpoy": 0,
        "allStar": 0,
        "allNba": {"first": 0, "second": 0, "third": 0},
        "titleSeasons": [],
        # Which season each award was won — powers the hover-highlighting of
        # stats-table rows. Keys mirror the accolade tiles.
        "awardSeasons": {
            "championships": [],
            "mvp": [],
            "finalsMvp": [],
            "dpoy": [],
            "allStar": [],
            "allNbaFirst": [],
            "allNbaSecond": [],
            "allNbaThird": [],
        },
    }
    tier = {"1": "first", "2": "second", "3": "third"}

    def add(key: str, season: str | None):
        if season:
            a["awardSeasons"][key].append(season)

    for r in rows:
        d = r.get("DESCRIPTION")
        season = r.get("SEASON")
        if d == "NBA Champion":
            a["championships"] += 1
            add("championships", season)
            if season:
                a["titleSeasons"].append(season)
        elif d == "NBA Most Valuable Player":
            a["mvp"] += 1
            add("mvp", season)
        elif d == "NBA Finals Most Valuable Player":
            a["finalsMvp"] += 1
            add("finalsMvp", season)
        elif d == "NBA Defensive Player of the Year":
            a["dpoy"] += 1
            add("dpoy", season)
        elif d == "NBA All-Star":
            a["allStar"] += 1
            add("allStar", season)
        elif d == "All-NBA":
            key = tier.get(str(r.get("ALL_NBA_TEAM_NUMBER")))
            if key:
                a["allNba"][key] += 1
                add("allNba" + key.capitalize(), season)
    return a


def main():
    # Windows consoles default to cp1250, which can't print ✓/✗ or accented
    # player names. Force UTF-8 output.
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:  # noqa: BLE001
        pass

    snapshot = json.loads(SNAPSHOT.read_text()) if SNAPSHOT.exists() else {}
    SNAPSHOT.parent.mkdir(parents=True, exist_ok=True)

    players = read_players()
    if LIMIT:
        players = players[:LIMIT]

    updated, failed = 0, []

    for slug, name in players:
        entry = snapshot.get(slug, {})
        # Skip only when fully synced AND the newest fields are present (so
        # existing snapshots get new fields added on the next run without --force).
        if not FORCE and entry.get("synced") and "awards" in entry and "teams" in entry:
            continue

        try:
            pid = resolve_id(slug, name)
            if not pid:
                raise RuntimeError("no nba_api player id (add to OVERRIDES)")

            # Career stats, requested as per-game averages.
            career = playercareerstats.PlayerCareerStats(
                player_id=pid, per_mode36="PerGame", timeout=30
            ).get_normalized_dict()
            time.sleep(0.8)

            # Metadata.
            info = commonplayerinfo.CommonPlayerInfo(
                player_id=pid, timeout=30
            ).get_normalized_dict()["CommonPlayerInfo"][0]
            time.sleep(0.8)

            # Awards / accolades.
            award_rows = playerawards.PlayerAwards(
                player_id=pid, timeout=30
            ).get_normalized_dict().get("PlayerAwards", [])
            time.sleep(0.8)

            team = " ".join(filter(None, [info.get("TEAM_CITY"), info.get("TEAM_NAME")])).strip()
            snapshot[slug] = {
                "synced": True,
                "nbaId": pid,
                "position": info.get("POSITION") or None,
                "height": info.get("HEIGHT") or None,
                "weight": info.get("WEIGHT") or None,
                "college": info.get("SCHOOL") or None,
                "draft_year": info.get("DRAFT_YEAR") or None,
                "team": team or None,
                "awards": aggregate_awards(award_rows),
                "teams": teams_played(career),
                "seasonStats": per_game_rows(career),
            }
            updated += 1
            a = snapshot[slug]["awards"]
            print(f"  ✓ {slug} (id {pid}, {a['championships']}×🏆 {a['mvp']}×MVP)")
        except Exception as err:  # noqa: BLE001
            failed.append(f"{name} ({err})")
            print(f"  ✗ {name} — {err}")

        # Persist after every player so an interruption is never lost.
        SNAPSHOT.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False))

    print("\n--- summary ---")
    print(f"updated: {updated}")
    print(f"snapshot: {SNAPSHOT}")
    if failed:
        print(f"failed: {len(failed)}")
        for f in failed:
            print(f"   - {f}")


if __name__ == "__main__":
    main()
