import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileProxyForm } from "@/components/FileProxyForm";
import { ContentViewer } from "@/components/ContentViewer";
import { useToast } from "@/hooks/use-toast";

export interface ProxyRequest {
  name: string;
  path: string;
}

export interface FetchedContent {
  content: string;
  contentType: string;
  url: string;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedContent, setFetchedContent] = useState<FetchedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("request");
  const { toast } = useToast();

  const handleProxyRequest = async (request: ProxyRequest) => {
    setIsLoading(true);
    setError(null);
    setFetchedContent(null);

    try {
      // Simulate GCS bucket mapping - in a real app, you'd configure this mapping
      const bucketName = `${request.name}-static-files`;
      const gcsUrl = `https://storage.googleapis.com/${bucketName}/${request.path}`;
      
      // For demo purposes, we'll use a CORS proxy or direct fetch
      // In production, you'd implement server-side GCS access
      const response = await fetch(gcsUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || 'text/plain';
      const content = await response.text();

      const result: FetchedContent = {
        content,
        contentType,
        url: gcsUrl
      };

      setFetchedContent(result);
      setActiveTab("content"); // Auto-switch to content tab
      toast({
        title: "Content loaded successfully",
        description: `Fetched ${request.path} from ${bucketName}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch content';
      setError(errorMessage);
      toast({
        title: "Error fetching content",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            GCS Static File Proxy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access static files from Google Cloud Storage buckets. Enter a name and path to fetch and display content 
            from your configured buckets.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="request">File Request</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="request" className="mt-0">
            <div className="max-w-2xl mx-auto">
              <Card className="p-6 shadow-soft">
                <FileProxyForm 
                  onSubmit={handleProxyRequest} 
                  isLoading={isLoading}
                />
              </Card>
              
              {/* Info Section */}
              <div className="mt-8">
                <Card className="p-8 bg-accent/50 border-accent">
                  <h2 className="text-2xl font-semibold mb-4 text-center">How it works</h2>
                  <div className="grid md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                        1
                      </div>
                      <h3 className="font-semibold mb-2">Enter Details</h3>
                      <p className="text-muted-foreground">
                        Provide the bucket name and file path you want to access
                      </p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                        2
                      </div>
                      <h3 className="font-semibold mb-2">Fetch Content</h3>
                      <p className="text-muted-foreground">
                        The app constructs the GCS URL and fetches your static files
                      </p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                        3
                      </div>
                      <h3 className="font-semibold mb-2">Display Result</h3>
                      <p className="text-muted-foreground">
                        View HTML, CSS, JS, or other static content directly in the browser
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="mt-0">
            <div className="w-full h-[calc(100vh-200px)]">
              <ContentViewer 
                content={fetchedContent}
                error={error}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;