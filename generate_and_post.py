#!/usr/bin/env python3
"""
generate_and_post.py — AI Sports Article Generator
====================================================
Generates a sports article via Ollama llama3.2 (enriched with live
DuckDuckGo news), fetches an image, saves it locally, then POSTs it
as multipart/form-data to the DEGEN•SPORTS Express backend.

pip install:
    pip install ollama duckduckgo-search requests python-dotenv

Usage:
    python generate_and_post.py
    python generate_and_post.py --topic "NBA playoffs results"
    python generate_and_post.py --topic "Premier League scores" --category soccer --post
"""

# ── pip install ollama duckduckgo-search requests python-dotenv ───────────────

import argparse
import json
import logging
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv
import ollama
from duckduckgo_search import DDGS

# ─────────────────────────────────────────────────────────────────────────────
# Config — loaded from .env, with sane defaults
# ─────────────────────────────────────────────────────────────────────────────

load_dotenv()

BACKEND_URL    = os.getenv("BACKEND_URL", "http://localhost:5001")
ADMIN_TOKEN    = os.getenv("ADMIN_TOKEN", "admin-secret-token")
OLLAMA_MODEL   = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_HOST    = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OUTPUT_DIR     = Path("generated_articles")
HTTP_TIMEOUT   = 30  # seconds

VALID_CATEGORIES = [
    "nhl", "nba", "nfl", "mlb", "soccer",
    "cfl", "golf", "tennis", "cricket", "other",
]

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("gen_post")

# ─────────────────────────────────────────────────────────────────────────────
# Step 1 — Search: DuckDuckGo real-time news
# ─────────────────────────────────────────────────────────────────────────────

def search_news(topic: str, max_results: int = 8) -> list[dict]:
    """Fetch up to max_results recent news snippets via duckduckgo_search."""
    log.info("Searching DuckDuckGo news: %r", topic)
    results = []
    try:
        with DDGS() as ddgs:
            for item in ddgs.news(topic, max_results=max_results):
                results.append({
                    "title": item.get("title", ""),
                    "body":  item.get("body", item.get("excerpt", "")),
                    "url":   item.get("url", ""),
                    "date":  item.get("date", ""),
                })
        log.info("Got %d search results", len(results))
    except Exception as exc:
        log.warning("DuckDuckGo search failed (%s) — proceeding with model knowledge only", exc)
    return results


def build_context_block(results: list[dict]) -> str:
    """Format search results into a readable block for the LLM prompt."""
    if not results:
        return "No live search results — use your training knowledge."
    lines = ["=== LIVE SEARCH CONTEXT ==="]
    for i, r in enumerate(results, 1):
        lines.append(f"\n[{i}] {r['title']}")
        if r["date"]:
            lines.append(f"    Date: {r['date']}")
        if r["body"]:
            lines.append(f"    {r['body'][:300]}")
        if r["url"]:
            lines.append(f"    Source: {r['url']}")
    lines.append("\n=== END CONTEXT ===")
    return "\n".join(lines)

# ─────────────────────────────────────────────────────────────────────────────
# Step 2 — Generate: llama3.2 via Ollama
# ─────────────────────────────────────────────────────────────────────────────

ARTICLE_PROMPT = """\
You are an elite sports journalist for a premium digital sports outlet (ESPN / Bleacher Report style).
Write with energy, authority and vivid detail. Use the live context below.

{context}

Write ONE complete markdown sports article about: "{topic}"

OUTPUT ONLY the markdown — no preamble, no explanation, just the article.

# [Catchy headline — max 12 words]

**[One-sentence subheadline]**

[Hook intro — 2-3 sentences, most dramatic fact first]

## The Action

[Detailed match/event recap — scores, key moments, turning points]

## Standout Performances

[2-3 athletes — stats, quotes, clutch moments]

## Tactical Breakdown

[Strategy, coaching decisions, what worked/failed]

## The Bigger Picture

[Standings impact, records, historical significance]

## Fan Reaction & Social Buzz

[Crowd/atmosphere, social media energy]

## What's Next

[Upcoming fixtures, predictions, strong closing line]

---
Target: 900-1200 words. Tone: authoritative, exciting, SEO-friendly.
"""


def generate_article(topic: str, context: str) -> str:
    """Call Ollama llama3.2 and return the generated markdown article."""
    # Verify Ollama is reachable first
    try:
        r = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=5)
        r.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(
            f"Ollama not reachable at {OLLAMA_HOST}. Is it running? ({exc})"
        )

    log.info("Generating article with %s …", OLLAMA_MODEL)
    prompt = ARTICLE_PROMPT.format(context=context, topic=topic)

    try:
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}],
            options={"temperature": 0.75, "num_predict": 2048},
        )
        text = response["message"]["content"].strip()
        log.info("Article generated — ~%d words", len(text.split()))
        return text
    except Exception as exc:
        raise RuntimeError(f"Ollama generation error: {exc}")

# ─────────────────────────────────────────────────────────────────────────────
# Step 3 — Parse: title, excerpt, tags, category
# ─────────────────────────────────────────────────────────────────────────────

def parse_title(markdown: str) -> str:
    """Extract the # headline."""
    for line in markdown.splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            return stripped[2:].strip()
    # Fallback: first non-empty line
    for line in markdown.splitlines():
        if line.strip():
            return line.strip()[:120]
    return "Sports Article"


def parse_excerpt(markdown: str, max_len: int = 180) -> str:
    """First real prose paragraph after the headline/subheadline."""
    skip_prefixes = ("#", "*", "-", "=", ">", "|")
    found_headline = False
    for line in markdown.splitlines():
        stripped = line.strip()
        if not found_headline:
            if stripped.startswith("# "):
                found_headline = True
            continue
        if not stripped:
            continue
        if any(stripped.startswith(p) for p in skip_prefixes):
            continue
        clean = re.sub(r"[*_`#~]", "", stripped)
        return clean[:max_len]
    return "Read the full article for all the action."


def parse_tags(topic: str, markdown: str) -> list[str]:
    """
    Extract up to 6 tags as a list of capitalised noun-like tokens.
    Returns a Python list (will be JSON-serialised when posting).
    """
    combined = topic + " " + markdown[:600]
    words = re.findall(r"\b[A-Z][a-zA-Z]{2,}\b", combined)
    seen: set[str] = set()
    tags: list[str] = []
    for w in words:
        lw = w.lower()
        if lw not in seen:
            seen.add(lw)
            tags.append(w)
        if len(tags) >= 6:
            break
    return tags or ["Sports", "News"]


def detect_category(topic: str) -> str:
    """Map topic keywords to a backend-valid category string."""
    tl = topic.lower()
    rules = {
        "nhl":    ["nhl", "hockey", "leafs", "oilers", "stanley cup", "bruins"],
        "nba":    ["nba", "basketball", "lakers", "celtics", "warriors", "lebron"],
        "nfl":    ["nfl", "super bowl", "chiefs", "patriots", "touchdown", "quarterback"],
        "mlb":    ["mlb", "baseball", "blue jays", "yankees", "dodgers", "world series"],
        "soccer": ["soccer", "premier league", "mls", "champions league", "fifa",
                   "world cup", "messi", "ronaldo", "arsenal", "chelsea", "football"],
        "cfl":    ["cfl", "grey cup", "roughriders", "blue bombers", "argonauts"],
        "golf":   ["golf", "pga", "masters", "open championship", "ryder cup"],
        "tennis": ["tennis", "wimbledon", "us open", "french open", "australian open",
                   "djokovic", "nadal", "federer", "swiatek"],
        "cricket":["cricket", "ipl", "test match", "t20", "ashes", "odi"],
    }
    for cat, keywords in rules.items():
        if any(kw in tl for kw in keywords):
            return cat
    return "other"

# ─────────────────────────────────────────────────────────────────────────────
# Step 4 — Image: Unsplash Source → picsum fallback
# ─────────────────────────────────────────────────────────────────────────────

SPORT_KEYWORDS = {
    "nhl":    "ice,hockey",
    "nba":    "basketball",
    "nfl":    "american,football",
    "mlb":    "baseball",
    "soccer": "soccer,football",
    "cfl":    "canadian,football",
    "golf":   "golf",
    "tennis": "tennis",
    "cricket":"cricket",
    "other":  "sport,action",
}


def fetch_image(category: str) -> tuple[bytes | None, str | None]:
    """
    Attempt to download a 1200×675 image.
    1. source.unsplash.com/random/?{sport,action}  (free, no API key)
    2. picsum.photos/1200/675                       (fallback)
    Returns (image_bytes, filename) or (None, None) on total failure.
    """
    keywords = SPORT_KEYWORDS.get(category, "sport,action")
    ts = int(time.time())

    sources = [
        f"https://source.unsplash.com/random/1200x675/?{keywords}&sig={ts}",
        f"https://picsum.photos/1200/675?random={ts}",
    ]

    for url in sources:
        try:
            log.info("Fetching image: %s", url)
            resp = requests.get(url, timeout=HTTP_TIMEOUT, allow_redirects=True)
            ctype = resp.headers.get("content-type", "")
            if resp.status_code == 200 and ctype.startswith("image"):
                filename = f"article_{category}_{ts}.jpg"
                log.info("Image OK — %d KB", len(resp.content) // 1024)
                return resp.content, filename
            log.warning("Image source returned %s / %s", resp.status_code, ctype)
        except requests.RequestException as exc:
            log.warning("Image fetch failed (%s): %s", url, exc)

    log.warning("All image sources failed — backend will use placeholder")
    return None, None

# ─────────────────────────────────────────────────────────────────────────────
# Step 5 — Save: write markdown file locally
# ─────────────────────────────────────────────────────────────────────────────

def save_locally(topic: str, markdown: str) -> Path:
    """Save article to generated_articles/<slug>_<timestamp>.md"""
    OUTPUT_DIR.mkdir(exist_ok=True)
    slug = re.sub(r"[^a-z0-9]+", "_", topic.lower()).strip("_")[:50]
    ts   = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = OUTPUT_DIR / f"{slug}_{ts}.md"
    path.write_text(markdown, encoding="utf-8")
    log.info("Saved → %s", path)
    return path

# ─────────────────────────────────────────────────────────────────────────────
# Step 6 — Post: multipart/form-data → POST /api/articles
# ─────────────────────────────────────────────────────────────────────────────

def post_article(
    title: str,
    content: str,
    excerpt: str,
    tags: list[str],
    category: str,
    image_bytes: bytes | None,
    image_filename: str | None,
) -> dict:
    """
    POST to http://localhost:5001/api/articles as multipart/form-data.

    Auth    : x-admin-token header (from ADMIN_TOKEN env var)
    Required: title, category, excerpt
    Optional: content, tags (JSON list), image file, placement flags
    """
    url = f"{BACKEND_URL}/api/articles"

    headers = {"x-admin-token": ADMIN_TOKEN}

    # Form fields — tags as JSON list as requested
    data = {
        "title":          title,
        "content":        content,
        "excerpt":        excerpt,
        "tags":           json.dumps(tags),   # JSON list per spec
        "category":       category,
        "isLatestNews":   "true",
        "showOnHomepage": "true",
        "isPublished":    "true",
        "status":         "published",
    }

    # Attach image if we have one
    files = {}
    if image_bytes and image_filename:
        files["image"] = (image_filename, image_bytes, "image/jpeg")

    log.info("POSTing to %s …", url)
    try:
        resp = requests.post(
            url,
            headers=headers,
            data=data,
            files=files or None,
            timeout=HTTP_TIMEOUT,
        )
        resp.raise_for_status()
        result = resp.json()
        log.info("Posted OK — id=%s slug=%s", result.get("id"), result.get("slug"))
        return result
    except requests.HTTPError as exc:
        body = exc.response.text if exc.response is not None else ""
        raise RuntimeError(
            f"Backend error {exc.response.status_code}: {body}"
        ) from exc
    except requests.RequestException as exc:
        raise RuntimeError(
            f"Cannot reach backend at {url}. Is the server running? ({exc})"
        ) from exc

# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

def get_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Generate & post an AI sports article to DEGEN•SPORTS"
    )
    p.add_argument(
        "--topic", "-t",
        type=str,
        help='Sports topic, e.g. "NBA playoffs 2026 latest scores"',
    )
    p.add_argument(
        "--category", "-c",
        choices=VALID_CATEGORIES,
        help="Force a category (auto-detected from topic if omitted)",
    )
    p.add_argument(
        "--post", "-p",
        action="store_true",
        help="Post without interactive confirmation prompt",
    )
    return p.parse_args()

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    args = get_args()

    # ── Topic ────────────────────────────────────────────────────────────────
    topic = args.topic
    if not topic:
        topic = input("Enter sports topic: ").strip()
    if not topic:
        log.error("No topic provided.")
        sys.exit(1)

    # ── Category ─────────────────────────────────────────────────────────────
    category = args.category or detect_category(topic)
    log.info("Category detected: %s", category)

    # ── Search ───────────────────────────────────────────────────────────────
    news_results = search_news(topic)
    context_block = build_context_block(news_results)

    # ── Generate ─────────────────────────────────────────────────────────────
    try:
        markdown = generate_article(topic, context_block)
    except RuntimeError as exc:
        log.error("%s", exc)
        sys.exit(1)

    # ── Parse metadata ────────────────────────────────────────────────────────
    title   = parse_title(markdown)
    excerpt = parse_excerpt(markdown)
    tags    = parse_tags(topic, markdown)

    # ── Fetch image ───────────────────────────────────────────────────────────
    image_bytes, image_filename = fetch_image(category)

    # ── Save locally ──────────────────────────────────────────────────────────
    saved_path = save_locally(topic, markdown)

    # ── Preview ───────────────────────────────────────────────────────────────
    divider = "─" * 60
    print(f"\n{divider}")
    print("  PREVIEW")
    print(divider)
    print(f"  Title    : {title}")
    print(f"  Category : {category}")
    print(f"  Excerpt  : {excerpt[:120]}…")
    print(f"  Tags     : {tags}")
    print(f"  Image    : {'✓ fetched (' + str(len(image_bytes) // 1024) + ' KB)' if image_bytes else '✗ using backend placeholder'}")
    print(f"  Saved at : {saved_path}")
    print(f"{divider}\n")
    print(markdown[:800])
    print(f"\n… [full article in {saved_path}]\n")

    # ── Confirm & post ────────────────────────────────────────────────────────
    if not args.post:
        answer = input("Post to website? (y/n): ").strip().lower()
        if answer not in ("y", "yes"):
            print("Not posted. Goodbye!")
            sys.exit(0)

    try:
        result = post_article(
            title=title,
            content=markdown,
            excerpt=excerpt,
            tags=tags,
            category=category,
            image_bytes=image_bytes,
            image_filename=image_filename,
        )
        print(f"\n{'═' * 60}")
        print("  ✅  PUBLISHED!")
        print(f"  ID    : {result.get('id')}")
        print(f"  Slug  : {result.get('slug')}")
        print(f"  Image : {result.get('imageUrl')}")
        print(f"  URL   : http://localhost:3000/article/{result.get('slug')}")
        print(f"{'═' * 60}\n")
    except RuntimeError as exc:
        log.error("Post failed: %s", exc)
        print(f"\n❌  {exc}")
        print(f"   Article saved locally: {saved_path}")
        sys.exit(1)


if __name__ == "__main__":
    main()
