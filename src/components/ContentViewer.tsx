import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Monitor, 
  Code, 
  Download, 
  ExternalLink, 
  AlertTriangle, 
  Loader2,
  FileText,
  Eye
} from "lucide-react";
import type { FetchedContent } from "@/pages/Index";

interface ContentViewerProps {
  content: FetchedContent | null;
  error: string | null;
  isLoading: boolean;
}

export const ContentViewer = ({ content, error, isLoading }: ContentViewerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState("preview");

  useEffect(() => {
    if (content && iframeRef.current && activeTab === "preview") {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        if (content.contentType.includes('html')) {
          doc.open();
          doc.write(content.content);
          doc.close();
        } else {
          // For non-HTML content, create a simple display
          doc.open();
          doc.write(`
            <html>
              <head>
                <title>Content Preview</title>
                <style>
                  body {
                    font-family: system-ui, sans-serif;
                    padding: 20px;
                    margin: 0;
                    background: #f8f9fa;
                  }
                  .content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #e1e5e9;
                    white-space: pre-wrap;
                    font-family: 'Monaco', 'Consolas', monospace;
                    font-size: 14px;
                    line-height: 1.5;
                  }
                  .header {
                    margin-bottom: 15px;
                    color: #666;
                    font-size: 12px;
                  }
                </style>
              </head>
              <body>
                <div class="header">Content-Type: ${content.contentType}</div>
                <div class="content">${content.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
              </body>
            </html>
          `);
          doc.close();
        }
      }
    }
  }, [content, activeTab]);

  const handleDownload = () => {
    if (!content) return;
    
    const blob = new Blob([content.content], { type: content.contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = content.url.split('/').pop() || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <h3 className="font-semibold mb-2">Fetching Content</h3>
        <p className="text-sm text-muted-foreground">
          Loading file from Google Cloud Storage...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-semibold mb-2 text-destructive">Error Loading Content</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {error}
        </p>
        <p className="text-xs text-muted-foreground">
          Make sure the bucket is publicly accessible or configure proper CORS settings.
        </p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-12 h-12 bg-muted text-muted-foreground rounded-lg flex items-center justify-center mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="font-semibold mb-2">No Content Loaded</h3>
        <p className="text-sm text-muted-foreground">
          Enter a bucket name and file path to get started
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Content Viewer</h2>
            <p className="text-sm text-muted-foreground">
              {content.contentType} • {content.content.length} bytes
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(content.url, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Direct
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="source" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Source
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="flex-1 mt-4">
          <div className="border rounded-lg h-96 bg-background">
            <iframe
              ref={iframeRef}
              className="w-full h-full rounded-lg"
              title="Content Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </TabsContent>

        <TabsContent value="source" className="flex-1 mt-4">
          <div className="border rounded-lg h-96 bg-muted/30 overflow-auto">
            <pre className="p-4 text-sm font-mono leading-relaxed">
              <code>{content.content}</code>
            </pre>
          </div>
        </TabsContent>
      </Tabs>

      <Separator className="my-4" />

      <div className="text-xs text-muted-foreground">
        <strong>Source URL:</strong>{" "}
        <code className="bg-muted px-1 py-0.5 rounded">{content.url}</code>
      </div>
    </div>
  );
};