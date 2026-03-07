#!/usr/bin/env python3
"""
Sports Article Generator — Ollama + DuckDuckGo + Auto-Post to DEGEN•SPORTS
===========================================================================
Generates a full sports article using llama3.2 via Ollama, enriched with
real-time DuckDuckGo search results, fetches a relevant image, saves it
locally, then posts it directly to the Express backend at localhost:5001.

SETUP — install dependencies:
    pip install ollama duckduckgo-search requests python-dotenv

USAGE:
    python sports_article_generator.py
    python sports_article_generator.py --topic "latest NBA playoffs 2026"
    python sports_article_generator.py --topic "Premier League title race" --category soccer --post

REQUIRED .env file (copy from .env.example):
    ADMIN_TOKEN=admin-secret-token
    BACKEND_URL=http://localhost:5001
"""

# ── Standard library ─────────────────────────────────────────────────────────
import argparse
import json
import logging
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

# ── Third-party ───────────────────────────────────────────────────────────────
try:
    import requests
except ImportError:
    sys.exit("Missing: pip install requests")

try:
    from dotenv import load_dotenv
except ImportError:
    sys.exit("Missing: pip install python-dotenv")

try:
    import ollama
except ImportError:
    sys.exit("Missing: pip install ollama")

try:
    from duckduckgo_search import DDGS
except ImportError:
    sys.exit("Missing: pip install duckduckgo-search")

# ── Config ────────────────────────────────────────────────────────────────────

load_dotenv()

BACKEND_URL   = os.getenv("BACKEND_URL", "http://localhost:5001")
ADMIN_TOKEN   = os.getenv("ADMIN_TOKEN", "admin-secret-token")
OLLAMA_MODEL  = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_HOST   = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OUTPUT_DIR    = Path("generated_articles")
REQUEST_TIMEOUT = 30   # seconds for HTTP calls

# Valid categories that the backend accepts
VALID_CATEGORIES = ["nhl", "nba", "nfl", "mlb", "soccer", "cfl", "golf", "tennis", "cricket", "other"]

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("sports_gen")

# ─────────────────────────────────────────────────────────────────────────────
# 1. SEARCH — get fresh real-world context from DuckDuckGo
# ─────────────────────────────────────────────────────────────────────────────

def search_topic(topic: str, max_results: int = 8) -> list[dict]:
    """Search DuckDuckGo for recent news on the topic. Returns list of {title, body, url}."""
    log.info("Searching DuckDuckGo for: %s", topic)
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.news(topic, max_results=max_results):
                results.append({
                    "title": r.get("title", ""),
                    "body":  r.get("body", r.get("excerpt", "")),
                    "url":   r.get("url", ""),
                    "date":  r.get("date", ""),
                })
        log.info("Found %d search results", len(results))
    except Exception as exc:
        log.warning("DuckDuckGo search failed (%s) — proceeding without web context", exc)
    return results


def format_search_context(results: list[dict]) -> str:
    """Format search results into a readable context block for the prompt."""
    if not results:
        return "No live search results available — use your training knowledge."
    lines = ["=== REAL-TIME SEARCH CONTEXT ==="]
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
# 2. GENERATE — call llama3.2 via Ollama
# ─────────────────────────────────────────────────────────────────────────────

def build_prompt(topic: str, search_context: str) -> str:
    """Construct the full prompt for llama3.2."""
    return f"""You are a world-class sports journalist writing for a premium sports news website (think ESPN, Bleacher Report, The Athletic). Your writing is vivid, energetic, and deeply insightful.

{search_context}

Using the real-time context above, write ONE complete, engaging sports article about:
"{topic}"

STRICT FORMAT — output ONLY the markdown article, nothing else:

# [Catchy, vivid headline — max 12 words]

**[One-sentence subheadline that teases the story]**

[INTRO — 2–3 sentences. Hook the reader immediately with the most dramatic/surprising fact or moment.]

## The Action: What Happened

[Match/event recap — key moments, turning points, final scores/results. Be specific with numbers, names, times.]

## Standout Performances

[Highlight 2–3 athletes. Stats, quotes (fabricate realistic ones if needed), body language, clutch moments.]

## Tactical Breakdown

[2–3 paragraphs on strategy, team dynamics, coaching decisions, what worked and what didn't.]

## The Bigger Picture

[Context: standings implications, records broken, historical significance, what this means for the season/tour.]

## Fan Reaction & Social Buzz

[Describe the atmosphere, crowd energy, social media reaction. Use vivid descriptions.]

## What's Next

[Upcoming fixtures, predictions, players/teams to watch. End with a strong forward-looking statement.]

---
*Article length: 900–1200 words. Tone: authoritative yet exciting. SEO-optimised. No filler phrases.*
"""


def generate_article(topic: str, search_context: str) -> str:
    """Send prompt to Ollama llama3.2 and return the generated markdown article."""
    log.info("Generating article with Ollama model: %s", OLLAMA_MODEL)

    # Verify Ollama is reachable before calling
    try:
        resp = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=5)
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(
            f"Cannot reach Ollama at {OLLAMA_HOST}. Is it running? ({exc})"
        )

    prompt = build_prompt(topic, search_context)

    try:
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}],
            options={"temperature": 0.75, "num_predict": 2048},
        )
        article_text = response["message"]["content"].strip()
        log.info("Article generated — ~%d words", len(article_text.split()))
        return article_text
    except Exception as exc:
        raise RuntimeError(f"Ollama generation failed: {exc}")

# ─────────────────────────────────────────────────────────────────────────────
# 3. PARSE — extract title, excerpt, tags from the generated markdown
# ─────────────────────────────────────────────────────────────────────────────

def extract_title(markdown: str) -> str:
    """Pull the # headline from the markdown."""
    for line in markdown.splitlines():
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip()
    # Fallback: first non-empty line
    for line in markdown.splitlines():
        if line.strip():
            return line.strip()[:100]
    return "Sports Article"


def extract_excerpt(markdown: str, max_len: int = 180) -> str:
    """Extract a clean excerpt: first real paragraph after the headline."""
    lines = markdown.splitlines()
    in_header = True
    for line in lines:
        stripped = line.strip()
        if in_header and (stripped.startswith("#") or stripped.startswith("**")):
            continue
        in_header = False
        if stripped and not stripped.startswith("#") and not stripped.startswith("*"):
            # Strip markdown bold/italic markers
            clean = re.sub(r"[*_`]", "", stripped)
            return clean[:max_len]
    return "Read the full article for all the action."


def extract_tags(topic: str, markdown: str) -> list[str]:
    """Generate relevant tags from the topic string."""
    words = re.findall(r"\b[A-Z][a-zA-Z]+\b", topic + " " + markdown[:500])
    seen = set()
    tags = []
    for w in words:
        lw = w.lower()
        if lw not in seen and len(lw) > 3:
            seen.add(lw)
            tags.append(w)
        if len(tags) >= 6:
            break
    return tags or ["sports", "news"]


def guess_category(topic: str) -> str:
    """Heuristic: map topic keywords to a valid backend category."""
    topic_lower = topic.lower()
    mapping = {
        "nhl":        ["nhl", "hockey", "leafs", "oilers", "canadiens", "bruins", "stanley cup"],
        "nba":        ["nba", "basketball", "lakers", "celtics", "warriors", "thunder", "lebron"],
        "nfl":        ["nfl", "football", "super bowl", "patriots", "chiefs", "touchdown"],
        "mlb":        ["mlb", "baseball", "blue jays", "yankees", "dodgers", "world series"],
        "soccer":     ["soccer", "football", "premier league", "mls", "champions league", "fifa",
                       "world cup", "messi", "ronaldo", "arsenal", "chelsea"],
        "cfl":        ["cfl", "grey cup", "roughriders", "blue bombers", "argonauts"],
        "golf":       ["golf", "pga", "masters", "open championship", "ryder cup"],
        "tennis":     ["tennis", "wimbledon", "us open", "french open", "australian open",
                       "djokovic", "federer", "nadal", "swiatek"],
        "cricket":    ["cricket", "ipl", "test match", "odi", "t20", "ashes"],
    }
    for cat, keywords in mapping.items():
        if any(kw in topic_lower for kw in keywords):
            return cat
    return "other"

# ─────────────────────────────────────────────────────────────────────────────
# 4. IMAGE — fetch a relevant image from Unsplash Source (free, no API key)
# ─────────────────────────────────────────────────────────────────────────────

def fetch_image(topic: str, category: str) -> tuple[bytes, str] | tuple[None, None]:
    """
    Download a relevant sport image.
    Uses Unsplash Source (free, redirects to a random matching photo).
    Falls back to picsum.photos if Unsplash fails.
    Returns (image_bytes, filename) or (None, None).
    """
    # Build a clean search query for Unsplash
    sport_keywords = {
        "nhl": "ice hockey", "nba": "basketball", "nfl": "american football",
        "mlb": "baseball", "soccer": "soccer football", "cfl": "canadian football",
        "golf": "golf", "tennis": "tennis", "cricket": "cricket", "other": "sports"
    }
    unsplash_query = sport_keywords.get(category, "sports").replace(" ", ",")
    timestamp = int(time.time())

    sources = [
        f"https://source.unsplash.com/1200x675/?{unsplash_query}&sig={timestamp}",
        f"https://picsum.photos/seed/{category}{timestamp}/1200/675",
    ]

    for url in sources:
        try:
            log.info("Fetching image from: %s", url)
            resp = requests.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
            if resp.status_code == 200 and resp.headers.get("content-type", "").startswith("image"):
                filename = f"article_{category}_{timestamp}.jpg"
                log.info("Image fetched successfully (%d KB)", len(resp.content) // 1024)
                return resp.content, filename
        except requests.RequestException as exc:
            log.warning("Image source failed (%s): %s", url, exc)

    log.warning("All image sources failed — article will use backend placeholder")
    return None, None

# ─────────────────────────────────────────────────────────────────────────────
# 5. SAVE — write the markdown file locally
# ─────────────────────────────────────────────────────────────────────────────

def save_article(topic: str, content: str) -> Path:
    """Save the markdown article to generated_articles/<slug>_<date>.md"""
    OUTPUT_DIR.mkdir(exist_ok=True)
    slug = re.sub(r"[^a-z0-9]+", "_", topic.lower()).strip("_")[:50]
    datestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = OUTPUT_DIR / f"{slug}_{datestamp}.md"
    filepath.write_text(content, encoding="utf-8")
    log.info("Article saved → %s", filepath)
    return filepath

# ─────────────────────────────────────────────────────────────────────────────
# 6. POST — submit to the Express backend at /api/articles
# ─────────────────────────────────────────────────────────────────────────────

def post_to_backend(
    title: str,
    excerpt: str,
    content: str,
    category: str,
    tags: list[str],
    image_bytes: bytes | None,
    image_filename: str | None,
) -> dict:
    """
    POST the article to POST /api/articles (multipart/form-data).
    Auth: x-admin-token header.
    Required fields: title, category, excerpt.
    Optional:        content, tags, image file, placement flags.
    """
    url = f"{BACKEND_URL}/api/articles"
    headers = {
        "x-admin-token": ADMIN_TOKEN,
    }

    # Build form data
    data = {
        "title":        title,
        "category":     category,
        "excerpt":      excerpt,
        "content":      content,
        "tags":         ",".join(tags),
        "isPublished":  "true",
        "isLatestNews": "true",
        "showOnHomepage": "true",
        "status":       "published",
    }

    # Attach image if available
    files = {}
    if image_bytes and image_filename:
        files["image"] = (image_filename, image_bytes, "image/jpeg")

    log.info("Posting article to %s", url)
    try:
        resp = requests.post(
            url,
            headers=headers,
            data=data,
            files=files if files else None,
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        result = resp.json()
        log.info("Article posted successfully! ID=%s  slug=%s", result.get("id"), result.get("slug"))
        return result
    except requests.HTTPError as exc:
        body = exc.response.text if exc.response else ""
        raise RuntimeError(f"Backend returned {exc.response.status_code}: {body}") from exc
    except requests.RequestException as exc:
        raise RuntimeError(
            f"Could not reach backend at {url}. Is the server running on port 5001? ({exc})"
        ) from exc

# ─────────────────────────────────────────────────────────────────────────────
# 7. MAIN — orchestrate everything
# ─────────────────────────────────────────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate and post a sports article using Ollama + DuckDuckGo"
    )
    parser.add_argument("--topic",    type=str, help="Sports topic to write about")
    parser.add_argument("--category", type=str, choices=VALID_CATEGORIES,
                        help="Article category (auto-detected if omitted)")
    parser.add_argument("--post",     action="store_true",
                        help="Auto-post without confirmation prompt")
    return parser.parse_args()


def print_banner():
    print("\n" + "═" * 60)
    print("  DEGEN•SPORTS  —  AI Article Generator")
    print("  Powered by Ollama llama3.2 + DuckDuckGo Search")
    print("═" * 60 + "\n")


def main():
    print_banner()
    args = parse_args()

    # ── Step 0: get topic ────────────────────────────────────────────────────
    topic = args.topic
    if not topic:
        topic = input("Enter sports topic (e.g. 'NBA playoffs 2026 latest scores'): ").strip()
    if not topic:
        log.error("No topic provided. Exiting.")
        sys.exit(1)

    # ── Step 1: determine category ───────────────────────────────────────────
    category = args.category or guess_category(topic)
    log.info("Category: %s", category)

    # ── Step 2: search DuckDuckGo ────────────────────────────────────────────
    search_results = search_topic(topic)
    search_context = format_search_context(search_results)

    # ── Step 3: generate article via Ollama ──────────────────────────────────
    try:
        article_markdown = generate_article(topic, search_context)
    except RuntimeError as exc:
        log.error("Generation failed: %s", exc)
        sys.exit(1)

    # ── Step 4: parse metadata ───────────────────────────────────────────────
    title   = extract_title(article_markdown)
    excerpt = extract_excerpt(article_markdown)
    tags    = extract_tags(topic, article_markdown)

    # ── Step 5: fetch image ──────────────────────────────────────────────────
    image_bytes, image_filename = fetch_image(topic, category)

    # ── Step 6: save locally ─────────────────────────────────────────────────
    saved_path = save_article(topic, article_markdown)

    # ── Step 7: preview ──────────────────────────────────────────────────────
    print("\n" + "─" * 60)
    print("  ARTICLE PREVIEW")
    print("─" * 60)
    print(f"  Title    : {title}")
    print(f"  Category : {category}")
    print(f"  Excerpt  : {excerpt[:120]}...")
    print(f"  Tags     : {', '.join(tags)}")
    print(f"  Image    : {'✓ fetched' if image_bytes else '✗ will use placeholder'}")
    print(f"  Saved    : {saved_path}")
    print("─" * 60)
    print("\n--- ARTICLE (first 800 chars) ---\n")
    print(article_markdown[:800])
    print("...\n[Full article saved to file above]\n")

    # ── Step 8: ask to post ───────────────────────────────────────────────────
    if args.post:
        do_post = True
    else:
        answer = input("Post this article to DEGEN•SPORTS website? (y/n): ").strip().lower()
        do_post = answer in ("y", "yes")

    if not do_post:
        print("\nArticle saved locally but NOT posted. Goodbye!")
        sys.exit(0)

    # ── Step 9: post to backend ───────────────────────────────────────────────
    print("\nPosting to backend...")
    try:
        result = post_to_backend(
            title=title,
            excerpt=excerpt,
            content=article_markdown,
            category=category,
            tags=tags,
            image_bytes=image_bytes,
            image_filename=image_filename,
        )
        print("\n" + "═" * 60)
        print("  ✅  ARTICLE PUBLISHED SUCCESSFULLY!")
        print(f"  ID       : {result.get('id')}")
        print(f"  Slug     : {result.get('slug')}")
        print(f"  URL      : {BACKEND_URL.replace(':5001','')}/article/{result.get('slug')}")
        print(f"  Image    : {result.get('imageUrl')}")
        print("═" * 60 + "\n")
    except RuntimeError as exc:
        log.error("Posting failed: %s", exc)
        print(f"\n❌  Failed to post: {exc}")
        print(f"   Article is still saved locally at: {saved_path}")
        sys.exit(1)


if __name__ == "__main__":
    main()
