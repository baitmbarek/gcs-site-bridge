import { useLocation, Link } from "react-router-dom";
import { ContentViewer } from "@/components/ContentViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { FetchedContent } from "./Index";

const Content = () => {
  const location = useLocation();
  const { content, error, isLoading } = location.state || {};

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to File Request
            </Button>
          </Link>
        </div>

        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Content Viewer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Displaying fetched content from your GCS bucket
          </p>
        </header>

        <div className="w-full h-[calc(100vh-250px)]">
          <ContentViewer 
            content={content}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Content;