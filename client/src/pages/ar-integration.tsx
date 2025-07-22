import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Maximize2, 
  RotateCw, 
  Eye, 
  Download,
  Loader2,
  Box,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";

interface Model3D {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  source: 'google-poly' | 'sketchfab';
  url: string;
  embedUrl: string;
  tags: string[];
  author: string;
  license: string;
}

const ArIntegration = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [models, setModels] = useState<Model3D[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [zoom, setZoom] = useState(1);
  const viewerRef = useRef<HTMLIFrameElement>(null);

  // Sample educational 3D models (these would come from actual APIs)
  const sampleModels: Model3D[] = [
    {
      id: "1",
      name: "Human Heart Anatomy",
      description: "Detailed 3D model of human heart showing chambers and vessels",
      thumbnail: "/api/placeholder/300/200",
      source: "sketchfab",
      url: "https://sketchfab.com/models/heart-anatomy",
      embedUrl: "https://sketchfab.com/models/heart-anatomy/embed",
      tags: ["anatomy", "biology", "heart", "medical"],
      author: "Medical Education Team",
      license: "Educational Use"
    },
    {
      id: "2", 
      name: "Solar System",
      description: "Complete solar system with planets and orbital mechanics",
      thumbnail: "/api/placeholder/300/200",
      source: "google-poly",
      url: "https://poly.google.com/view/solar-system",
      embedUrl: "https://poly.google.com/view/solar-system/embed",
      tags: ["astronomy", "planets", "space", "physics"],
      author: "NASA Education",
      license: "Creative Commons"
    },
    {
      id: "3",
      name: "Plant Cell Structure", 
      description: "3D cross-section of plant cell showing organelles",
      thumbnail: "/api/placeholder/300/200",
      source: "sketchfab",
      url: "https://sketchfab.com/models/plant-cell",
      embedUrl: "https://sketchfab.com/models/plant-cell/embed",
      tags: ["biology", "cell", "plant", "organelles"],
      author: "Biology Lab",
      license: "Educational Use"
    },
    {
      id: "4",
      name: "Molecular Structure - Water",
      description: "H2O molecule showing atomic bonds and electron clouds",
      thumbnail: "/api/placeholder/300/200", 
      source: "google-poly",
      url: "https://poly.google.com/view/water-molecule",
      embedUrl: "https://poly.google.com/view/water-molecule/embed",
      tags: ["chemistry", "molecule", "water", "atoms"],
      author: "Chemistry Department", 
      license: "MIT License"
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search term for 3D models",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    try {
      // Call the AR integration search API
      const response = await fetch('/api/agents/ar-integration/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          source: 'sketchfab', // Use Sketchfab as primary source
          educational: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        setModels(data.models || []);
        
        toast({
          title: "Search Complete",
          description: `Found ${data.count} 3D models matching "${searchQuery}"`,
        });
      } else {
        throw new Error(data.error || 'Search failed');
      }
      
    } catch (error) {
      console.error('AR search error:', error);
      
      // Fallback to sample models for demonstration
      const filteredModels = sampleModels.filter(model => 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      setModels(filteredModels);
      
      toast({
        title: "Using Demo Models", 
        description: `Showing ${filteredModels.length} sample educational models. Real API integration requires valid API keys.`,
        variant: "default"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleModelSelect = async (model: Model3D) => {
    setSelectedModel(model);
    setIsMaximized(false);
    setZoom(1);
    setIsRotating(false);
    
    // Get enhanced embed URL if available
    try {
      const response = await fetch('/api/agents/ar-integration/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: model.source,
          id: model.id,
          options: {
            autostart: true,
            ui_controls: true,
            ui_infos: true,
            ui_inspector: true,
            ui_watermark: false
          }
        }),
      });

      const data = await response.json();
      
      if (data.success && data.embedUrl) {
        // Update the model with the enhanced embed URL
        setSelectedModel({
          ...model,
          embedUrl: data.embedUrl
        });
      }
    } catch (error) {
      console.error('Failed to get embed URL:', error);
      // Continue with existing embed URL
    }
    
    toast({
      title: "Model Loaded",
      description: `Now viewing: ${model.name}`,
    });
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const toggleRotation = () => {
    setIsRotating(!isRotating);
    
    if (viewerRef.current) {
      // Send rotation command to iframe (this would be implemented with postMessage API)
      viewerRef.current.contentWindow?.postMessage({
        action: isRotating ? 'stopRotation' : 'startRotation',
        speed: rotationSpeed
      }, '*');
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownloadModel = (model: Model3D) => {
    toast({
      title: "Download Started",
      description: `Downloading ${model.name} for offline use`,
    });
    
    // This would trigger actual download from the respective API
    window.open(model.url, '_blank');
  };

  const suggestedSearches = [
    "human anatomy",
    "solar system",
    "molecular structure",
    "plant cell",
    "chemical bonds", 
    "geological formations",
    "historical artifacts",
    "mathematical shapes"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AR Integration Studio
          </h1>
          <p className="text-xl text-gray-600">
            Explore 3D educational models with Sketchfab integration
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-600" />
                  Search 3D Models
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g., human heart, solar system..."
                      className="h-12"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSearch}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search Models
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Suggested Searches:
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedSearches.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto py-2 px-3"
                        onClick={() => setSearchQuery(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Models List */}
            {models.length > 0 && (
              <Card className="mt-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-indigo-600" />
                    Found Models ({models.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {models.map((model) => (
                      <div
                        key={model.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedModel?.id === model.id 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleModelSelect(model)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Box className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{model.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={model.source === 'sketchfab' ? 'default' : 'secondary'}>
                                {model.source === 'sketchfab' ? 'Sketchfab' : 'Google Poly'}
                              </Badge>
                              <span className="text-xs text-gray-500">{model.author}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 3D Viewer */}
          <div className="lg:col-span-2">
            <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-xl transition-all ${
              isMaximized ? 'fixed inset-4 z-50' : ''
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-600" />
                    3D Model Viewer
                  </span>
                  {selectedModel && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleZoomOut}
                        disabled={zoom <= 0.5}
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600 min-w-12 text-center">
                        {Math.round(zoom * 100)}%
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleZoomIn}
                        disabled={zoom >= 3}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleRotation}
                      >
                        {isRotating ? <Pause className="w-4 h-4" /> : <RotateCw className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleMaximize}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedModel ? (
                  <div className="space-y-4">
                    <div 
                      className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden"
                      style={{ 
                        height: isMaximized ? 'calc(100vh - 200px)' : '500px',
                        transform: `scale(${zoom})`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <iframe
                        ref={viewerRef}
                        src={selectedModel.embedUrl}
                        className="w-full h-full border-0"
                        title={selectedModel.name}
                        allow="autoplay; fullscreen; vr"
                      />
                      
                      {/* Overlay Controls */}
                      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <Badge variant={selectedModel.source === 'sketchfab' ? 'default' : 'secondary'}>
                            {selectedModel.source === 'sketchfab' ? 'Sketchfab' : 'Google Poly'}
                          </Badge>
                          <span>{selectedModel.name}</span>
                        </div>
                      </div>

                      {/* Rotation Indicator */}
                      {isRotating && (
                        <div className="absolute top-4 right-4 bg-green-500/80 backdrop-blur-sm rounded-full p-2">
                          <RotateCw className="w-4 h-4 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Model Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{selectedModel.name}</h4>
                          <p className="text-gray-600 text-sm mb-2">{selectedModel.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>By {selectedModel.author}</span>
                            <span>•</span>
                            <span>{selectedModel.license}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedModel.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadModel(selectedModel)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Box className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      No 3D model selected
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Search for educational 3D models and select one to view in AR
                    </p>
                    <Button
                      onClick={() => setSearchQuery("human anatomy")}
                      variant="outline"
                    >
                      Try Sample Search
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArIntegration;