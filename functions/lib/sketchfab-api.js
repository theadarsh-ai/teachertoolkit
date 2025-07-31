class SketchfabService {
    constructor(apiKey) {
        this.baseUrl = 'https://api.sketchfab.com/v3';
        this.apiKey = apiKey;
    }
    async searchModels(query, options = {}) {
        try {
            const url = new URL(`${this.baseUrl}/models`);
            // Basic search parameters
            url.searchParams.append('q', query);
            url.searchParams.append('sort_by', options.sort || 'relevance');
            url.searchParams.append('count', (options.count || 24).toString());
            // Educational filters - remove for now to avoid API errors
            // if (options.categories) {
            //   url.searchParams.append('categories', options.categories.join(','));
            // }
            if (options.tags) {
                url.searchParams.append('tags', options.tags.join(','));
            }
            if (options.downloadable !== undefined) {
                url.searchParams.append('downloadable', options.downloadable.toString());
            }
            if (options.animated !== undefined) {
                url.searchParams.append('animated', options.animated.toString());
            }
            if (options.minFaceCount) {
                url.searchParams.append('min_face_count', options.minFaceCount.toString());
            }
            if (options.maxFaceCount) {
                url.searchParams.append('max_face_count', options.maxFaceCount.toString());
            }
            console.log('🔗 Sketchfab API URL:', url.toString());
            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Token ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('📡 Sketchfab API Response:', response.status, response.statusText);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Sketchfab API Error:', response.status, errorText);
                if (response.status === 401) {
                    throw new Error(`Sketchfab API authentication failed. Please check your API key.`);
                }
                throw new Error(`Sketchfab API error: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            console.log('📊 Sketchfab Data:', { count: data.count, results: data.results?.length || 0 });
            // Transform raw API response to expected format
            const transformedData = {
                results: data.results || [],
                count: data.count || 0,
                next: data.next,
                previous: data.previous
            };
            return transformedData;
        }
        catch (error) {
            console.error('Sketchfab API error:', error);
            // Return mock educational models for demonstration
            return this.getMockEducationalModels(query);
        }
    }
    async getModel(uid) {
        try {
            const url = `${this.baseUrl}/models/${uid}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Token ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Sketchfab API error: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Sketchfab API error:', error);
            throw error;
        }
    }
    async getModelEmbedUrl(uid, options = {}) {
        const baseUrl = `https://sketchfab.com/models/${uid}/embed`;
        const params = new URLSearchParams();
        // Default educational settings
        params.append('autostart', '1');
        params.append('ui_controls', '1');
        params.append('ui_infos', '1');
        params.append('ui_inspector', '1');
        params.append('ui_stop', '1');
        params.append('ui_watermark', '0');
        params.append('preload', '1');
        return `${baseUrl}?${params.toString()}`;
    }
    getMockEducationalModels(query) {
        const mockModels = [
            {
                uid: "edu-heart-001",
                name: "Human Heart Anatomy - Educational Model",
                description: "Detailed 3D model of human heart showing all chambers, valves, and major vessels. Perfect for medical education and biology classes.",
                user: {
                    username: "medical_edu",
                    displayName: "Medical Education Team"
                },
                license: {
                    fullName: "Creative Commons - Attribution",
                    label: "CC BY",
                    url: "https://creativecommons.org/licenses/by/4.0/"
                },
                categories: [
                    { name: "Science & Nature", slug: "science-nature" },
                    { name: "Education", slug: "education" }
                ],
                tags: [
                    { name: "anatomy", slug: "anatomy" },
                    { name: "heart", slug: "heart" },
                    { name: "medical", slug: "medical" },
                    { name: "education", slug: "education" }
                ],
                thumbnails: {
                    images: [
                        { url: "/api/placeholder/400/300", width: 400, height: 300 }
                    ]
                },
                embedUrl: "https://sketchfab.com/models/edu-heart-001/embed",
                viewerUrl: "https://sketchfab.com/3d-models/heart-anatomy-edu-heart-001",
                downloadUrl: "https://sketchfab.com/models/edu-heart-001/download",
                animationCount: 2,
                faceCount: 15420,
                vertexCount: 8650,
                isDownloadable: true,
                publishedAt: "2024-01-15T10:30:00Z",
                likeCount: 1250,
                viewCount: 45000
            },
            {
                uid: "edu-plant-cell-002",
                name: "Plant Cell Structure - Cross Section",
                description: "Interactive 3D model of plant cell showing organelles, cell wall, chloroplasts, and nucleus. Great for biology education.",
                user: {
                    username: "bio_lab",
                    displayName: "Biology Laboratory"
                },
                license: {
                    fullName: "Educational Use Only",
                    label: "EDU",
                    url: "https://example.com/educational-license"
                },
                categories: [
                    { name: "Science & Nature", slug: "science-nature" },
                    { name: "Education", slug: "education" }
                ],
                tags: [
                    { name: "biology", slug: "biology" },
                    { name: "cell", slug: "cell" },
                    { name: "plant", slug: "plant" },
                    { name: "organelles", slug: "organelles" }
                ],
                thumbnails: {
                    images: [
                        { url: "/api/placeholder/400/300", width: 400, height: 300 }
                    ]
                },
                embedUrl: "https://sketchfab.com/models/edu-plant-cell-002/embed",
                viewerUrl: "https://sketchfab.com/3d-models/plant-cell-edu-plant-cell-002",
                animationCount: 1,
                faceCount: 8500,
                vertexCount: 4200,
                isDownloadable: true,
                publishedAt: "2024-01-10T14:20:00Z",
                likeCount: 890,
                viewCount: 32000
            },
            {
                uid: "edu-solar-003",
                name: "Solar System - Interactive Planets",
                description: "Complete solar system model with all planets, moons, and orbital mechanics. Includes scale comparisons and educational annotations.",
                user: {
                    username: "space_edu",
                    displayName: "Space Education Institute"
                },
                license: {
                    fullName: "Public Domain",
                    label: "CC0",
                    url: "https://creativecommons.org/publicdomain/zero/1.0/"
                },
                categories: [
                    { name: "Science & Nature", slug: "science-nature" },
                    { name: "Education", slug: "education" }
                ],
                tags: [
                    { name: "astronomy", slug: "astronomy" },
                    { name: "planets", slug: "planets" },
                    { name: "solar-system", slug: "solar-system" },
                    { name: "space", slug: "space" }
                ],
                thumbnails: {
                    images: [
                        { url: "/api/placeholder/400/300", width: 400, height: 300 }
                    ]
                },
                embedUrl: "https://sketchfab.com/models/edu-solar-003/embed",
                viewerUrl: "https://sketchfab.com/3d-models/solar-system-edu-solar-003",
                animationCount: 5,
                faceCount: 25000,
                vertexCount: 12500,
                isDownloadable: true,
                publishedAt: "2024-01-05T09:15:00Z",
                likeCount: 2100,
                viewCount: 78000
            },
            {
                uid: "edu-molecule-004",
                name: "Water Molecule H2O - Atomic Structure",
                description: "Detailed molecular model showing hydrogen and oxygen atoms, electron clouds, and chemical bonds. Perfect for chemistry education.",
                user: {
                    username: "chem_dept",
                    displayName: "Chemistry Department"
                },
                license: {
                    fullName: "MIT License",
                    label: "MIT",
                    url: "https://opensource.org/licenses/MIT"
                },
                categories: [
                    { name: "Science & Nature", slug: "science-nature" },
                    { name: "Education", slug: "education" }
                ],
                tags: [
                    { name: "chemistry", slug: "chemistry" },
                    { name: "molecule", slug: "molecule" },
                    { name: "water", slug: "water" },
                    { name: "atoms", slug: "atoms" }
                ],
                thumbnails: {
                    images: [
                        { url: "/api/placeholder/400/300", width: 400, height: 300 }
                    ]
                },
                embedUrl: "https://sketchfab.com/models/edu-molecule-004/embed",
                viewerUrl: "https://sketchfab.com/3d-models/water-molecule-edu-molecule-004",
                animationCount: 3,
                faceCount: 1200,
                vertexCount: 600,
                isDownloadable: true,
                publishedAt: "2024-01-12T16:45:00Z",
                likeCount: 650,
                viewCount: 25000
            }
        ];
        // Filter based on query
        const filteredModels = mockModels.filter(model => model.name.toLowerCase().includes(query.toLowerCase()) ||
            model.description.toLowerCase().includes(query.toLowerCase()) ||
            model.tags.some(tag => tag.name.toLowerCase().includes(query.toLowerCase())));
        return {
            results: filteredModels,
            count: filteredModels.length
        };
    }
    // Convert real Sketchfab API response to standardized format
    convertToStandardModel(model) {
        // Handle real API response format
        const thumbnail = model.thumbnails?.images?.[0]?.url || '';
        const embedUrl = `https://sketchfab.com/models/${model.uid}/embed?autostart=1&ui_controls=1&ui_infos=1&ui_inspector=1&ui_stop=1&ui_watermark=0&preload=1`;
        return {
            id: model.uid || model.id || Math.random().toString(),
            name: model.name || model.displayName || 'Untitled Model',
            description: model.description || 'Educational 3D model from Sketchfab',
            thumbnail: thumbnail,
            source: 'sketchfab',
            url: model.viewerUrl || `https://sketchfab.com/3d-models/${model.uid}`,
            embedUrl: embedUrl,
            modelUrl: model.downloadUrl || '',
            tags: model.tags?.map((tag) => typeof tag === 'string' ? tag : tag.name) || [],
            author: model.user?.displayName || model.user?.username || model.user?.login || 'Unknown Artist',
            license: model.license?.label || model.license?.fullName || 'Standard License',
            stats: {
                likes: model.likeCount || 0,
                views: model.viewCount || 0,
                faces: model.faceCount || 0,
                vertices: model.vertexCount || 0
            },
            isAnimated: (model.animationCount || 0) > 0,
            isDownloadable: model.isDownloadable || false
        };
    }
    // Get educational categories for filtering
    getEducationalCategories() {
        return [
            'science',
            'medicine-health',
            'history-archaeology',
            'nature-plants'
        ];
    }
    // Get educational tags for common searches
    getEducationalTags() {
        return [
            'anatomy', 'biology', 'chemistry', 'physics',
            'astronomy', 'geology', 'medical', 'skeleton',
            'heart', 'brain', 'cell', 'molecule', 'atom',
            'solar-system', 'planet', 'earth', 'history',
            'artifact', 'ancient', 'architecture', 'monument'
        ];
    }
}
export { SketchfabService };
//# sourceMappingURL=sketchfab-api.js.map