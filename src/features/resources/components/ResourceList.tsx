import { FileText, Link2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Resource } from "@/data/types/resources.types";
import { formatFileSize } from "@/features/resources/lib/format-file-size";

type ResourceListProps = {
  resources: Resource[];
  isLoading: boolean;
  downloadingFileId: string | null;
  onViewFile: (resource: Resource) => void;
};

function getResourceIcon(resource: Resource) {
  if (resource.resource_type === "file") {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  return <Link2 className="h-5 w-5 text-blue-500" />;
}

export function ResourceList({
  resources,
  isLoading,
  downloadingFileId,
  onViewFile,
}: ResourceListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">Loading resources...</div>
        </CardContent>
      </Card>
    );
  }

  if (resources.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No resources available</p>
            <p className="text-sm mt-2">Your mentor hasn&apos;t shared any resources yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
                {resource.resource_type === "file" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => onViewFile(resource)}
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
  );
}
