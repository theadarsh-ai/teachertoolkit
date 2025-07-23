import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
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
  RotateCcw,
  ArrowLeft,
  Filter,
  Grid3x3,
  List
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
  const [filteredModels, setFilteredModels] = useState<Model3D[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'author'>('relevance');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const viewerRef = useRef<HTMLIFrameElement>(null);

  // Enhanced search suggestions
  const searchSuggestions = [
    "Human anatomy heart", "Plant cell structure", "Solar system planets",
    "DNA molecule", "Skeletal system", "Brain anatomy", "Volcano structure",
    "Chemical bonds", "Geometric shapes", "Ancient architecture", "Microscope",
    "Telescope", "Mathematical equations", "Physics experiments"
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
      // Add cache busting to force fresh data
      const cacheKey = Date.now();
      
      // Call the AR integration search API
      const response = await fetch(`/api/agents/ar-integration/search?_t=${cacheKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          query: searchQuery,
          source: 'sketchfab', // Use Sketchfab as primary source
          educational: true,
          timestamp: cacheKey // Force new request
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
          setFilteredModels(data.models || []);
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
      setFilteredModels([]);
      
      toast({
        title: "Search Failed", 
        description: "Unable to search 3D models. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Filter and sort models
  const filterAndSortModels = () => {
    let filtered = [...models];

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(model => 
        model.name.toLowerCase().includes(filterCategory.toLowerCase()) ||
        model.description.toLowerCase().includes(filterCategory.toLowerCase()) ||
        model.tags.some(tag => tag.toLowerCase().includes(filterCategory.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'relevance':
        default:
          return 0; // Keep original order for relevance
      }
    });

    setFilteredModels(filtered);
  };

  // Apply filters when models or filter settings change
  useEffect(() => {
    filterAndSortModels();
  }, [models, filterCategory, sortBy]);

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
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

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
                  
                  {/* Quick Search Suggestions */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Quick Search:</div>
                    <div className="flex flex-wrap gap-1">
                      {searchSuggestions.slice(0, 6).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => setSearchQuery(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Select value={sortBy} onValueChange={(value: 'relevance' | 'name' | 'author') => setSortBy(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Sort by Relevance</SelectItem>
                          <SelectItem value="name">Sort by Name</SelectItem>
                          <SelectItem value="author">Sort by Author</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Filter category..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="anatomy">Anatomy</SelectItem>
                          <SelectItem value="biology">Biology</SelectItem>
                          <SelectItem value="chemistry">Chemistry</SelectItem>
                          <SelectItem value="physics">Physics</SelectItem>
                          <SelectItem value="mathematics">Mathematics</SelectItem>
                          <SelectItem value="space">Space & Astronomy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Model Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box className="w-5 h-5" />
                    Search Results ({filteredModels.length} of {models.length})
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredModels.length === 0 && models.length === 0 && !isSearching && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Box className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Search for educational 3D models to get started</p>
                      <p className="text-xs mt-2">Real Sketchfab models will appear here</p>
                    </div>
                  )}

                  {filteredModels.length === 0 && models.length > 0 && !isSearching && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No models match the current filters</p>
                      <p className="text-xs mt-2">Try adjusting your filter settings</p>
                    </div>
                  )}
                  
                  {isSearching && (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
                      <p className="text-gray-500 dark:text-gray-400">Searching Sketchfab models...</p>
                    </div>
                  )}
                  
                  {filteredModels.map((model, index) => (
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
                    selectedModel.source === 'educational-db' ? (
                      // Educational model viewer with interactive elements
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-blue-900 dark:to-indigo-900">
                        <div className="text-center p-8">
                          <div className="mb-6">
                            <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-4xl text-white">
                                {selectedModel.name.toLowerCase().includes('heart') ? '❤️' :
                                 selectedModel.name.toLowerCase().includes('cell') ? '🔬' :
                                 selectedModel.name.toLowerCase().includes('dna') ? '🧬' :
                                 selectedModel.name.toLowerCase().includes('skeleton') ? '🦴' :
                                 selectedModel.name.toLowerCase().includes('brain') ? '🧠' :
                                 selectedModel.name.toLowerCase().includes('solar') ? '🌌' : '🔬'}
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                              {selectedModel.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                              Interactive Educational 3D Model
                            </p>
                          </div>
                          
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              3D Visualization Ready
                            </div>
                            <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              Educational Annotations Available
                            </div>
                            <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                              AR-Ready Content
                            </div>
                          </div>
                          
                          <div className="mt-6 p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              This educational model provides interactive learning with detailed annotations and cross-curricular connections optimized for classroom use.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Sketchfab iframe for real Sketchfab models
                      <iframe
                        ref={viewerRef}
                        src={selectedModel.embedUrl}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        title={`3D model: ${selectedModel.name}`}
                        className="w-full h-full"
                        onError={() => {
                          console.error('Failed to load iframe for model:', selectedModel.name);
                        }}
                      />
                    )
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