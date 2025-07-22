#!/usr/bin/env python3
"""
Direct AR Integration with Sketchfab API
Bypasses agent system for faster, direct model search
"""

import os
import sys
import json
import requests
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

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

class SketchfabDirectAPI:
    def __init__(self):
        self.api_key = os.getenv('SKETCHFAB_API_KEY')
        self.base_url = 'https://api.sketchfab.com/v3'
        
    def search_models(self, query: str, count: int = 20) -> List[Model3D]:
        """Search for 3D models directly from Sketchfab"""
        if not self.api_key:
            print("ERROR: SKETCHFAB_API_KEY not found", file=sys.stderr)
            return []
            
        url = f"{self.base_url}/models"
        headers = {
            'Authorization': f'Token {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        params = {
            'q': query,
            'sort_by': 'relevance',
            'count': count,
            'downloadable': 'true'
        }
        
        try:
            print(f"🔍 Direct search for: {query}", file=sys.stderr)
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code != 200:
                print(f"❌ API Error: {response.status_code}", file=sys.stderr)
                return []
                
            data = response.json()
            models = []
            
            for item in data.get('results', []):
                # Extract thumbnail URL
                thumbnail = ''
                if item.get('thumbnails') and item['thumbnails'].get('images'):
                    thumbnail = item['thumbnails']['images'][0].get('url', '')
                
                # Create embed URL
                embed_url = f"https://sketchfab.com/models/{item['uid']}/embed?autostart=1&ui_controls=1&ui_infos=1&ui_inspector=1&ui_stop=1&ui_watermark=0&preload=1"
                
                model = Model3D(
                    id=item['uid'],
                    name=item.get('name', 'Untitled Model'),
                    description=item.get('description', 'Educational 3D model from Sketchfab'),
                    thumbnail=thumbnail,
                    source='sketchfab',
                    url=item.get('viewerUrl', f"https://sketchfab.com/3d-models/{item['uid']}"),
                    embed_url=embed_url,
                    tags=[tag.get('name', tag) if isinstance(tag, dict) else str(tag) for tag in item.get('tags', [])],
                    author=item.get('user', {}).get('displayName', 'Unknown Artist'),
                    license=item.get('license', {}).get('label', 'Standard License')
                )
                models.append(model)
                
            print(f"✅ Found {len(models)} models directly", file=sys.stderr)
            return models
            
        except Exception as e:
            print(f"❌ Search error: {str(e)}", file=sys.stderr)
            return []

def main():
    """Main function for direct AR search"""
    if len(sys.argv) < 2:
        print("Usage: python ar-integration-direct.py <search_query>")
        return
        
    query = ' '.join(sys.argv[1:])
    api = SketchfabDirectAPI()
    models = api.search_models(query)
    
    # Convert to JSON format expected by frontend
    result = {
        "success": True,
        "query": query,
        "source": "sketchfab-direct",
        "count": len(models),
        "models": [
            {
                "id": m.id,
                "name": m.name,
                "description": m.description,
                "thumbnail": m.thumbnail,
                "source": m.source,
                "url": m.url,
                "embedUrl": m.embed_url,
                "tags": m.tags,
                "author": m.author,
                "license": m.license
            }
            for m in models
        ]
    }
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()