// Google Poly API integration for 3D models
// Note: Google Poly API was discontinued in 2021, but this shows the integration pattern

interface PolyAsset {
  name: string;
  displayName: string;
  authorName: string;
  description: string;
  formats: Array<{
    formatType: string;
    resources: Array<{
      url: string;
      contentType: string;
    }>;
  }>;
  thumbnail: {
    url: string;
  };
  license: string;
  visibility: string;
  isCurated: boolean;
  presentationParams: {
    backgroundColor: string;
    orientingRotation: {
      w: number;
      x: number;
      y: number;
      z: number;
    };
  };
}

interface PolySearchResponse {
  assets: PolyAsset[];
  nextPageToken?: string;
  totalSize: number;
}

class GooglePolyService {
  private apiKey: string;
  private baseUrl = 'https://poly.googleapis.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchAssets(query: string, maxResults: number = 20): Promise<PolySearchResponse> {
    try {
      // Note: This is for educational purposes - Google Poly API was discontinued
      // In practice, you would use alternative 3D model APIs like:
      // - Sketchfab API
      // - TurboSquid API  
      // - CGTrader API
      // - Open3DModel API

      const url = new URL(`${this.baseUrl}/assets`);
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('keywords', query);
      url.searchParams.append('maxResults', maxResults.toString());
      url.searchParams.append('format', 'GLTF2');
      url.searchParams.append('category', 'EDUCATIONAL');

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Google Poly API error: ${response.status}`);
      }

      const data: PolySearchResponse = await response.json();
      return data;

    } catch (error) {
      console.error('Google Poly API error:', error);
      
      // Return mock data for demonstration
      return this.getMockEducationalModels(query);
    }
  }

  async getAsset(assetId: string): Promise<PolyAsset> {
    try {
      const url = `${this.baseUrl}/assets/${assetId}?key=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Poly API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Google Poly API error:', error);
      throw error;
    }
  }

  private getMockEducationalModels(query: string): PolySearchResponse {
    const mockAssets: PolyAsset[] = [
      {
        name: "assets/solar-system-model",
        displayName: "Solar System Interactive Model",
        authorName: "NASA Education Team", 
        description: "Complete solar system with planets, moons, and orbital mechanics for educational use",
        formats: [{
          formatType: "GLTF2",
          resources: [{
            url: "https://example.com/solar-system.gltf",
            contentType: "model/gltf+json"
          }]
        }],
        thumbnail: {
          url: "https://example.com/thumbnails/solar-system.jpg"
        },
        license: "CC-BY",
        visibility: "PUBLIC",
        isCurated: true,
        presentationParams: {
          backgroundColor: "#000011",
          orientingRotation: { w: 1, x: 0, y: 0, z: 0 }
        }
      },
      {
        name: "assets/human-heart-anatomy",
        displayName: "Human Heart Anatomy Model",
        authorName: "Medical Education Lab",
        description: "Detailed anatomical model of human heart showing chambers, valves, and major vessels",
        formats: [{
          formatType: "GLTF2", 
          resources: [{
            url: "https://example.com/heart-anatomy.gltf",
            contentType: "model/gltf+json"
          }]
        }],
        thumbnail: {
          url: "https://example.com/thumbnails/heart.jpg"
        },
        license: "CC-BY-SA",
        visibility: "PUBLIC",
        isCurated: true,
        presentationParams: {
          backgroundColor: "#f8f9fa",
          orientingRotation: { w: 1, x: 0, y: 0, z: 0 }
        }
      },
      {
        name: "assets/plant-cell-structure",
        displayName: "Plant Cell Cross-Section",
        authorName: "Biology Department",
        description: "3D cross-section of plant cell showing organelles, cell wall, and chloroplasts",
        formats: [{
          formatType: "GLTF2",
          resources: [{
            url: "https://example.com/plant-cell.gltf", 
            contentType: "model/gltf+json"
          }]
        }],
        thumbnail: {
          url: "https://example.com/thumbnails/plant-cell.jpg"
        },
        license: "CC0",
        visibility: "PUBLIC", 
        isCurated: true,
        presentationParams: {
          backgroundColor: "#e8f5e8",
          orientingRotation: { w: 1, x: 0, y: 0, z: 0 }
        }
      }
    ];

    // Filter based on query
    const filteredAssets = mockAssets.filter(asset => 
      asset.displayName.toLowerCase().includes(query.toLowerCase()) ||
      asset.description.toLowerCase().includes(query.toLowerCase())
    );

    return {
      assets: filteredAssets,
      totalSize: filteredAssets.length
    };
  }

  // Convert Poly asset to standardized format
  convertToStandardModel(asset: PolyAsset) {
    const gltfFormat = asset.formats.find(f => f.formatType === 'GLTF2');
    const modelUrl = gltfFormat?.resources[0]?.url || '';

    return {
      id: asset.name.split('/').pop() || '',
      name: asset.displayName,
      description: asset.description,
      thumbnail: asset.thumbnail.url,
      source: 'google-poly' as const,
      url: `https://poly.google.com/view/${asset.name.split('/').pop()}`,
      embedUrl: `https://poly.google.com/view/${asset.name.split('/').pop()}/embed`,
      modelUrl: modelUrl,
      tags: [], // Would need to extract from description or metadata
      author: asset.authorName,
      license: asset.license,
      backgroundColor: asset.presentationParams?.backgroundColor || '#ffffff'
    };
  }
}

export { GooglePolyService };
export type { PolyAsset, PolySearchResponse };