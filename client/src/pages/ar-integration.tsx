import { useState, useRef } from "react";
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
        console.log('📥 FRONTEND RECEIVED:', data.models?.length, 'models');
        console.log('📥 First model data:', data.models?.[0]);
        
        // Force clear existing models first
        setModels([]);
        
        // Then set new models after a tiny delay to force re-render
        setTimeout(() => {
          setModels(data.models || []);
          console.log('📥 Models set in state:', data.models?.slice(0, 2).map((m: any) => ({ name: m.name, author: m.author, id: m.id })));
        }, 10);
        
        toast({
          title: "Search Complete",
          description: `Found ${data.count} 3D models matching "${searchQuery}"`,
        });
      } else {
        throw new Error(data.error || 'Search failed');
      }
      
    } catch (error) {
      console.error('AR search error:', error);
      
      // Show empty results instead of demo models
      setModels([]);
      
      toast({
        title: "Search Failed", 
        description: "Unable to search 3D models. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleModelSelect = async (model: Model3D) => {
    try {
      // Get embed URL for the selected model
      const response = await fetch('/api/agents/ar-integration/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: model.id,
          source: model.source
        }),
      });

      const data = await response.json();
      
      if (data.success && data.embedUrl) {
        setSelectedModel({
          ...model,
          embedUrl: data.embedUrl
        });
      } else {
        setSelectedModel(model);
      }
      
    } catch (error) {
      console.error('Error getting embed URL:', error);
      setSelectedModel(model);
    }
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleRotate = () => {
    setIsRotating(!isRotating);
    // In a real implementation, you would send rotation commands to the 3D viewer
    if (viewerRef.current) {
      // Add rotation control via postMessage to iframe
      viewerRef.current.contentWindow?.postMessage({
        type: 'rotate',
        enabled: !isRotating,
        speed: rotationSpeed
      }, '*');
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? zoom * 1.2 : zoom * 0.8;
    setZoom(Math.max(0.5, Math.min(3.0, newZoom)));
    
    if (viewerRef.current) {
      viewerRef.current.contentWindow?.postMessage({
        type: 'zoom',
        level: newZoom
      }, '*');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AR Integration Agent
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Explore educational 3D models with interactive AR capabilities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search 3D Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search for 3D models..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSearch}
                      disabled={isSearching}
                      size="icon"
                    >
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Try searching: "human anatomy", "solar system", "plant cell", "chemical bonds"
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Model Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="w-5 h-5" />
                  Search Results ({models.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {models.length === 0 && !isSearching && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Box className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Search for educational 3D models to get started</p>
                    </div>
                  )}
                  
                  {models.map((model, index) => (
                    <div
                      key={`${model.id}-${index}`}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedModel?.id === model.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleModelSelect(model)}
                    >
                      <div className="flex gap-3">
                        <img 
                          src={model.thumbnail || '/api/placeholder/80/60'} 
                          alt={model.name}
                          className="w-20 h-15 object-cover rounded flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/api/placeholder/80/60';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate mb-1" title={model.name}>
                            {model.name} {/* DEBUG: {model.id.slice(0, 8)} */}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {model.description || 'Educational 3D model'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>by {model.author || 'Unknown'}</span>
                            <Badge variant="secondary" className="text-xs">
                              {model.source || 'sketchfab'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3D Viewer Panel */}
          <div className="lg:col-span-2">
            <Card className={`${isMaximized ? 'fixed inset-4 z-50' : 'h-full'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    3D Model Viewer
                    {selectedModel && (
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                        - {selectedModel.name}
                      </span>
                    )}
                  </CardTitle>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleZoom('out')}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleZoom('in')}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRotate}
                      className={isRotating ? 'bg-blue-100 dark:bg-blue-900' : ''}
                    >
                      {isRotating ? <Pause className="w-4 h-4" /> : <RotateCw className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleMaximize}>
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`${isMaximized ? 'h-full' : 'h-96'} bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden`}>
                  {selectedModel ? (
                    <iframe
                      ref={viewerRef}
                      src={selectedModel.embedUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; fullscreen; xr-spatial-tracking"
                      title={`3D model: ${selectedModel.name}`}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">Select a 3D Model</p>
                        <p className="text-sm">Search and click on a model to view it here</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedModel && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedModel.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          by {selectedModel.author}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{selectedModel.source}</Badge>
                        <Badge variant="outline">{selectedModel.license}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {selectedModel.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedModel.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedModel.url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-1" />
                          View Original
                        </a>
                      </Button>
                    </div>
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