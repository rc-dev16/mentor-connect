import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDownloadResource } from "@/data/hooks/useDownloads";
import { useResources } from "@/data/hooks/useResources";
import type { Resource } from "@/data/types/resources.types";
import { ResourceList } from "@/features/resources/components/ResourceList";

const MenteeResourcesPage = () => {
  const { toast } = useToast();
  const { data: resourcesData, isLoading } = useResources();
  const downloadResource = useDownloadResource();
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  const resources: Resource[] = Array.isArray(resourcesData) ? resourcesData : [];

  const handleViewFile = async (resource: Resource) => {
    if (!resource.file_url) return;

    try {
      setDownloadingFileId(resource.id);
      await downloadResource.mutateAsync(resource);
    } catch (error: unknown) {
      console.error("Error viewing file:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to view file",
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

      <ResourceList
        resources={resources}
        isLoading={isLoading}
        downloadingFileId={downloadingFileId}
        onViewFile={handleViewFile}
      />
    </div>
  );
};

export default MenteeResourcesPage;
