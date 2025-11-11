import { useEffect, useState } from "react";
import { FileText, Link2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import apiService from "@/services/api";

interface Resource {
  id: string;
  title: string;
  url: string;
  description?: string;
  resource_type?: string;
  file_url?: string;
  mime_type?: string;
  file_size?: number;
  created_at: string;
}

const Resources = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading resources:', e);
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getResourceIcon = (resource: Resource) => {
    if (resource.resource_type === 'file') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <Link2 className="h-5 w-5 text-blue-500" />;
  };

  const handleViewFile = async (resource: Resource) => {
    if (!resource.file_url) return;
    
    try {
      setDownloadingFileId(resource.id);
      const blob = await apiService.downloadResourceFile(resource.file_url);
      
      // Create a blob URL
      const url = window.URL.createObjectURL(blob);
      
      // For PDFs, open in new tab
      if (resource.mime_type === 'application/pdf') {
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          // If popup blocked, fall back to download
          const link = document.createElement('a');
          link.href = url;
          link.download = `${resource.title}.pdf`;
          link.click();
        }
      } else {
        // For Word docs, download directly
        const link = document.createElement('a');
        link.href = url;
        const ext = resource.file_url.split('.').pop() || 'doc';
        link.download = `${resource.title}.${ext}`;
        link.click();
      }
      
      // Clean up the blob URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error: any) {
      console.error('Error viewing file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to view file"
      });
    } finally {
      setDownloadingFileId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Resources</h1>
        <p className="text-muted-foreground mt-2">Access study materials and resources shared by your mentor</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">Loading resources...</div>
          </CardContent>
        </Card>
      ) : resources.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No resources available</p>
              <p className="text-sm mt-2">Your mentor hasn't shared any resources yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Available Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                {getResourceIcon(resource)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-base truncate">{resource.title}</p>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      )}
                    </div>
                    {resource.resource_type === 'file' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => handleViewFile(resource)}
                        disabled={downloadingFileId === resource.id}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {downloadingFileId === resource.id ? "Loading..." : "View File"}
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="shrink-0" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open Link
                        </a>
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {resource.file_size && (
                      <Badge variant="secondary" className="font-normal">
                        {formatFileSize(resource.file_size)}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="font-normal">
                      Added {new Date(resource.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Resources;
