import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Globe, Folder, Plus } from "lucide-react";
import type { ProxyRequest } from "@/pages/Index";

interface FileProxyFormProps {
  onSubmit: (request: ProxyRequest) => Promise<void>;
  isLoading: boolean;
}

export const FileProxyForm = ({ onSubmit, isLoading }: FileProxyFormProps) => {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [isCustomBucket, setIsCustomBucket] = useState(false);

  // Predefined bucket options
  const predefinedBuckets = [
    "project-dev",
    "project-staging", 
    "project-prod",
    "my-app",
    "web-assets",
    "static-content"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !path.trim()) return;
    
    await onSubmit({
      name: name.trim(),
      path: path.trim()
    });
  };

  const isValid = name.trim() && path.trim();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">File Request</h2>
          <p className="text-sm text-muted-foreground">Configure your GCS access</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Bucket Name Identifier
          </Label>
          {!isCustomBucket ? (
            <div className="space-y-2">
              <Select 
                value={name} 
                onValueChange={(value) => {
                  if (value === "custom") {
                    setIsCustomBucket(true);
                    setName("");
                  } else {
                    setName(value);
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a bucket or add custom..." />
                </SelectTrigger>
                <SelectContent>
                  {predefinedBuckets.map((bucket) => (
                    <SelectItem key={bucket} value={bucket}>
                      {bucket}
                    </SelectItem>
                  ))}
                  <Separator />
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add custom bucket...
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter custom bucket name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCustomBucket(false);
                  setName("");
                }}
                className="text-xs"
              >
                ← Back to predefined buckets
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            This will be mapped to: <code className="bg-muted px-1 py-0.5 rounded text-xs">{name || 'name'}-static-files</code>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="path" className="text-sm font-medium">
            File Path
          </Label>
          <Input
            id="path"
            type="text"
            placeholder="e.g., index.html, assets/app.js"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Relative path to the file in the bucket
          </p>
        </div>

        <Separator />

        {name && path && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Generated URL Preview
            </h4>
            <code className="text-xs break-all bg-background px-2 py-1 rounded border">
              https://storage.googleapis.com/{name}-static-files/{path}
            </code>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={!isValid || isLoading}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching Content...
            </>
          ) : (
            "Fetch Content"
          )}
        </Button>
      </form>
    </div>
  );
};