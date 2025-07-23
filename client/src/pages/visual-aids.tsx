import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image, Wand2, Download, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
  labels?: Array<{text: string; x: number; y: number; size: number}>;
}

export default function VisualAids() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);

  const generateImage = async (imagePrompt: string) => {
    if (!imagePrompt.trim()) {
      toast({
        title: "Please enter a description",
        description: "Describe the image you want to generate",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/agents/visual-aids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          style: 'educational',
          size: '1024x1024'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (data.imageUrl) {
          const newImage: GeneratedImage = {
            url: data.imageUrl,
            prompt: imagePrompt,
            timestamp: Date.now(),
            labels: data.labels || []
          };
          
          setCurrentImage(newImage);
          setGeneratedImages(prev => [newImage, ...prev].slice(0, 10)); // Keep last 10 images
          
          toast({
            title: "Visual Aid Generated!",
            description: `${data.format === 'svg' ? 'Vector diagram' : 'Image'} created successfully${data.model ? ` using ${data.model}` : ''}`,
          });
        } else if (data.textDescription) {
          // Handle fallback mode with text description
          toast({
            title: "Description Generated",
            description: "A detailed text description was created for your visual aid",
            variant: "default",
          });
          
          // You could display the text description in the UI here
          console.log('Generated description:', data.textDescription);
        } else {
          throw new Error('No image or description generated');
        }
      } else {
        throw new Error(data.message || 'Failed to generate visual aid');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateImage(prompt);
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visual-aid-${prompt.slice(0, 30)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Image is being downloaded",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the image",
        variant: "destructive",
      });
    }
  };

  const suggestedPrompts = [
    "Solar system diagram with clearly labeled planets, orbits, and distances",
    "Human heart anatomy with bold labels for all chambers and vessels",
    "Water cycle process with large text labels for evaporation, condensation, precipitation",
    "Plant cell structure with clearly marked organelles and their functions",
    "Food chain diagram showing energy flow with readable species names",
    "Mathematical geometric shapes with angle measurements and property labels",
    "Chemical bond types with clear molecular diagrams and bond labels",
    "India political map with state names in large, readable fonts"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Image className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Visual Aids Designer
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Generate educational images and diagrams with AI
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  Describe Your Visual Aid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Description
                    </label>
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Solar system with planets and labels..."
                      className="h-12"
                      disabled={isGenerating}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>
                </form>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Suggested Ideas:
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedPrompts.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto py-2 px-3"
                        onClick={() => setPrompt(suggestion)}
                        disabled={isGenerating}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Image Display */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-purple-600" />
                    Generated Visual Aid
                  </span>
                  {currentImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadImage(currentImage.url, currentImage.prompt)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentImage ? (
                  <div className="space-y-4">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={currentImage.url}
                        alt={currentImage.prompt}
                        className="w-full h-auto max-h-96 object-contain"
                      />
                      {/* Text overlay for clean labels */}
                      {currentImage.labels && currentImage.labels.length > 0 && (
                        <svg 
                          className="absolute top-0 left-0 w-full h-full"
                          viewBox="0 0 1024 1024"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          {currentImage.labels.map((label: any, index: number) => (
                            <text
                              key={index}
                              x={label.x}
                              y={label.y}
                              fontSize={label.size || 18}
                              fill="black"
                              fontFamily="Arial, sans-serif"
                              fontWeight="bold"
                              textAnchor="middle"
                              stroke="white"
                              strokeWidth="3"
                              paintOrder="stroke"
                            >
                              {label.text}
                            </text>
                          ))}
                        </svg>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Prompt Used:</h4>
                      <p className="text-gray-600">{currentImage.prompt}</p>
                      {currentImage.labels && currentImage.labels.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Enhanced with {currentImage.labels.length} clear text labels
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Generated on {new Date(currentImage.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      No image generated yet
                    </h3>
                    <p className="text-gray-400">
                      Enter a description and click "Generate Image" to create your visual aid
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Images Gallery */}
        {generatedImages.length > 0 && (
          <Card className="mt-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                Recent Visual Aids
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {generatedImages.map((image, index) => (
                  <div
                    key={index}
                    className="cursor-pointer group relative bg-gray-100 rounded-lg overflow-hidden aspect-square"
                    onClick={() => setCurrentImage(image)}
                  >
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Button size="sm" variant="secondary">
                        View
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs truncate">
                        {image.prompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}