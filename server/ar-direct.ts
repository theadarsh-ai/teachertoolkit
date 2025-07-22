/**
 * Direct AR Integration - Simplified Sketchfab API calls
 * Bypasses agent system for faster model search
 */

interface SketchfabModel {
  uid: string;
  name: string;
  description: string;
  thumbnails?: {
    images: Array<{ url: string; width: number; height: number }>;
  };
  user: {
    displayName: string;
  };
  license?: {
    label: string;
  };
}

interface StandardModel {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  source: string;
  url: string;
  embedUrl: string;
  tags: string[];
  author: string;
  license: string;
}

export class DirectARService {
  private apiKey: string;
  private baseUrl = 'https://api.sketchfab.com/v3';

  constructor() {
    this.apiKey = process.env.SKETCHFAB_API_KEY || '';
  }

  async searchModels(query: string, count = 20): Promise<StandardModel[]> {
    if (!this.apiKey) {
      console.error('❌ SKETCHFAB_API_KEY not configured');
      return [];
    }

    try {
      const params = new URLSearchParams({
        q: query,
        sort_by: 'relevance',
        count: count.toString(),
        downloadable: 'true'
      });

      const response = await fetch(`${this.baseUrl}/models?${params}`, {
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`❌ Sketchfab API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const models = data.results || [];

      console.log(`✅ Found ${models.length} models for "${query}"`);

      return models.map((model: SketchfabModel) => this.convertModel(model));
    } catch (error) {
      console.error('❌ Sketchfab search error:', error);
      return [];
    }
  }

  private convertModel(model: SketchfabModel): StandardModel {
    // Get best thumbnail
    const thumbnail = model.thumbnails?.images?.[0]?.url || '';
    
    // Create embed URL
    const embedUrl = `https://sketchfab.com/models/${model.uid}/embed?autostart=1&ui_controls=1&ui_infos=1&ui_inspector=1&ui_stop=1&ui_watermark=0&preload=1`;

    return {
      id: model.uid,
      name: model.name || 'Untitled Model',
      description: model.description || 'Educational 3D model from Sketchfab',
      thumbnail,
      source: 'sketchfab',
      url: `https://sketchfab.com/3d-models/${model.uid}`,
      embedUrl,
      tags: [],
      author: model.user?.displayName || 'Unknown Artist',
      license: model.license?.label || 'Standard License'
    };
  }
}

// Export singleton instance
export const directARService = new DirectARService();