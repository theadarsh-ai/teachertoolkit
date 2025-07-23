#!/usr/bin/env python3
"""
Direct AR Integration with Sketchfab API
Bypasses agent system for faster, direct model search.
"""

import os
import sys
import json
import math
import argparse
import requests
from typing import List, Dict, Any
from dataclasses import dataclass, asdict

try:
    from rapidfuzz import fuzz
except ImportError:
    fuzz = None  # optional

# ---------- Data model ----------

@dataclass
class Model3D:
    id: str
    name: str
    description: str
    thumbnail: str
    source: str
    url: str
    embed_url: str
    tags: List[str]
    author: str
    license: str

# ---------- API wrapper ----------

class SketchfabDirectAPI:
    def __init__(self, api_key: str | None = None, timeout: int = 10):
        self.api_key = api_key or os.getenv("SKETCHFAB_API_KEY")
        if not self.api_key:
            raise RuntimeError("SKETCHFAB_API_KEY not set")
        self.base_url = "https://api.sketchfab.com/v3"
        self.timeout = timeout

    def search_models(
        self,
        query: str,
        count: int = 20,
        downloadable: bool = True,
        page_size: int = 20,
        re_rank: bool = False,
    ) -> List[Model3D]:
        """
        Search Sketchfab models. Will fetch multiple pages until `count` reached.
        Optionally re-rank locally with fuzzy matching.
        """
        fetched: List[Model3D] = []
        url = f"{self.base_url}/models"

        headers = {
            "Authorization": f"Token {self.api_key}",
            "Content-Type": "application/json",
        }

        params = {
            "q": query,
            "sort_by": "relevance",          # 'relevance', 'likes', 'viewCount', 'publishDate'
            "downloadable": str(downloadable).lower(),
            "count": page_size,              # page size (max 100)
        }

        next_url: str | None = url
        while next_url and len(fetched) < count:
            print(f"🔍 Requesting: {next_url}", file=sys.stderr)
            resp = requests.get(next_url, headers=headers, params=params if next_url == url else None, timeout=self.timeout)
            if resp.status_code != 200:
                print(f"❌ API Error: {resp.status_code} -> {resp.text}", file=sys.stderr)
                break

            data = resp.json()
            for item in data.get("results", []):
                fetched.append(self._parse_model(item))

                if len(fetched) >= count:
                    break

            # handle pagination
            next_url = data.get("next")

        if re_rank and fuzz:
            fetched = self._rerank(query, fetched)

        return fetched[:count]

    @staticmethod
    def _parse_model(item: Dict[str, Any]) -> Model3D:
        assets = item.get("thumbnails", {}).get("images", [])
        thumb = max(assets, key=lambda a: a.get("width", 0), default={}).get("url", "")
        viewer_url = item.get("embedUrl") or f"https://sketchfab.com/models/{item['uid']}/embed"
        return Model3D(
            id=item["uid"],
            name=item.get("name", ""),
            description=item.get("description", "") or "",
            thumbnail=thumb,
            source="sketchfab",
            url=item.get("viewerUrl") or f"https://sketchfab.com/3d-models/{item['slug']}" if item.get("slug") else f"https://sketchfab.com/models/{item['uid']}",
            embed_url=viewer_url,
            tags=[t.get("name", "") for t in item.get("tags", [])],
            author=item.get("user", {}).get("displayName", ""),
            license=item.get("license", {}).get("label", ""),
        )

    @staticmethod
    def _rerank(query: str, models: List[Model3D]) -> List[Model3D]:
        def score(m: Model3D) -> int:
            title_score = fuzz.token_sort_ratio(query, m.name) if fuzz else 0
            desc_score = fuzz.partial_ratio(query, m.description) if fuzz else 0
            tag_score = max((fuzz.partial_ratio(query, t) for t in m.tags), default=0) if fuzz else 0
            return max(title_score, desc_score, tag_score)

        return sorted(models, key=score, reverse=True)

# ---------- CLI ----------

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Search Sketchfab models directly.")
    p.add_argument("query", help="Search query")
    p.add_argument("-n", "--count", type=int, default=20, help="Number of results")
    p.add_argument("--no-downloadable", action="store_true", help="Allow non-downloadable models")
    p.add_argument("--no-rerank", action="store_true", help="Disable local fuzzy reranking")
    p.add_argument("--pretty", action="store_true", help="Pretty print JSON")
    p.add_argument("--table", action="store_true", help="Print compact table")
    return p.parse_args()

def print_table(models: List[Model3D]):
    from textwrap import shorten
    print(f"{'ID':8}  {'NAME':40}  {'AUTHOR':18}  {'LICENSE':10}")
    print("-" * 88)
    for m in models:
        print(f"{m.id[:8]:8}  {shorten(m.name, width=40):40}  {shorten(m.author, 18):18}  {shorten(m.license, 10):10}")

def main():
    args = parse_args()
    api = SketchfabDirectAPI()
    models = api.search_models(
        query=args.query,
        count=args.count,
        downloadable=not args.no_downloadable,
        re_rank=not args.no_rerank,
    )

    if args.table:
        print_table(models)
    else:
        if args.pretty:
            print(json.dumps([asdict(m) for m in models], indent=2, ensure_ascii=False))
        else:
            print(json.dumps([asdict(m) for m in models], ensure_ascii=False))

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
