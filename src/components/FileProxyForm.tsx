import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Globe, Folder, Plus, File, Clock, HardDrive, ChevronRight } from "lucide-react";
import type { ProxyRequest } from "@/pages/Index";

interface FileProxyFormProps {
  onSubmit: (request: ProxyRequest) => Promise<void>;
  isLoading: boolean;
}

interface BucketObject {
  name: string;
  lastModified: string;
  size: string;
  type: 'file' | 'folder';
}

export const FileProxyForm = ({ onSubmit, isLoading }: FileProxyFormProps) => {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [customBucket, setCustomBucket] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isLoadingObjects, setIsLoadingObjects] = useState(false);
  const [bucketObjects, setBucketObjects] = useState<BucketObject[]>([]);

  // Mock predefined buckets
  const predefinedBuckets = [
    "project-dev",
    "project-staging", 
    "project-prod",
    "my-app",
    "web-assets",
    "static-content"
  ];

  // Mock objects data (sorted by most recent first)
  const mockObjects: Record<string, BucketObject[]> = {
    "project-dev": [
      { name: "app.js", lastModified: "2024-01-15T10:30:00Z", size: "45.2 KB", type: "file" },
      { name: "index.html", lastModified: "2024-01-15T09:15:00Z", size: "2.1 KB", type: "file" },
      { name: "styles.css", lastModified: "2024-01-14T16:45:00Z", size: "8.7 KB", type: "file" },
      { name: "assets/", lastModified: "2024-01-14T14:20:00Z", size: "-", type: "folder" },
      { name: "config.json", lastModified: "2024-01-13T11:30:00Z", size: "1.2 KB", type: "file" },
    ],
    "project-staging": [
      { name: "bundle.js", lastModified: "2024-01-16T08:20:00Z", size: "120.5 KB", type: "file" },
      { name: "main.css", lastModified: "2024-01-15T17:30:00Z", size: "15.3 KB", type: "file" },
      { name: "favicon.ico", lastModified: "2024-01-15T12:45:00Z", size: "4.2 KB", type: "file" },
    ],
    "project-prod": [
      { name: "production.js", lastModified: "2024-01-18T14:22:00Z", size: "89.1 KB", type: "file" },
      { name: "robots.txt", lastModified: "2024-01-17T09:10:00Z", size: "234 B", type: "file" },
    ]
  };

  const handleBucketSelect = async (bucket: string) => {
    setSelectedBucket(bucket);
    setSelectedObject(null);
    setIsLoadingObjects(true);

    // Simulate API call delay
    setTimeout(() => {
      setBucketObjects(mockObjects[bucket] || []);
      setIsLoadingObjects(false);
    }, 800);
  };

  const handleCustomBucketSubmit = () => {
    if (customBucket.trim()) {
      handleBucketSelect(customBucket.trim());
      setShowCustomInput(false);
    }
  };

  const handleFetchContent = async () => {
    if (!selectedBucket || !selectedObject) return;
    
    await onSubmit({
      name: selectedBucket,
      path: selectedObject
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const canFetchContent = selectedBucket && selectedObject && !isLoading;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">File Explorer</h2>
          <p className="text-sm text-muted-foreground">Browse GCS buckets and select files</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bucket Selection Panel */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-4 h-4" />
            <Label className="text-sm font-medium">Select Bucket</Label>
          </div>
          
          <div className="space-y-2">
            {predefinedBuckets.map((bucket) => (
              <div
                key={bucket}
                onClick={() => handleBucketSelect(bucket)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                  selectedBucket === bucket 
                    ? "border-primary bg-primary/10" 
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    <span className="text-sm font-medium">{bucket}</span>
                  </div>
                  {selectedBucket === bucket && (
                    <ChevronRight className="w-4 h-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {bucket}-static-files
                </p>
              </div>
            ))}
            
            <Separator className="my-3" />
            
            {!showCustomInput ? (
              <Button
                variant="outline"
                onClick={() => setShowCustomInput(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Bucket
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Enter bucket name..."
                  value={customBucket}
                  onChange={(e) => setCustomBucket(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomBucketSubmit()}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCustomBucketSubmit}
                    disabled={!customBucket.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomBucket("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Objects Selection Panel */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <File className="w-4 h-4" />
            <Label className="text-sm font-medium">
              {selectedBucket ? `Objects in ${selectedBucket}` : "Select Objects"}
            </Label>
          </div>

          {!selectedBucket ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <div className="text-center">
                <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a bucket to view objects</p>
              </div>
            </div>
          ) : isLoadingObjects ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading objects...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bucketObjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No objects found in this bucket</p>
                </div>
              ) : (
                bucketObjects.map((object) => (
                  <div
                    key={object.name}
                    onClick={() => object.type === 'file' && setSelectedObject(object.name)}
                    className={`p-3 rounded-lg border transition-all ${
                      object.type === 'file' 
                        ? `cursor-pointer hover:bg-muted/50 ${
                            selectedObject === object.name 
                              ? "border-primary bg-primary/10" 
                              : "border-border"
                          }`
                        : "opacity-60 cursor-not-allowed border-border/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {object.type === 'file' ? (
                          <File className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate">{object.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">{object.size}</span>
                        {selectedObject === object.name && (
                          <ChevronRight className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(object.lastModified)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Fetch Content Button */}
      <div className="mt-6">
        <Button 
          onClick={handleFetchContent}
          disabled={!canFetchContent}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching Content...
            </>
          ) : (
            `Fetch Content${selectedBucket && selectedObject ? `: ${selectedObject}` : ""}`
          )}
        </Button>
        
        {selectedBucket && selectedObject && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            From: <code className="bg-muted px-1 py-0.5 rounded">{selectedBucket}-static-files/{selectedObject}</code>
          </p>
        )}
      </div>
    </div>
  );
};