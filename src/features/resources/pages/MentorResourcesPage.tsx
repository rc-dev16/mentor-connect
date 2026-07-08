import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDownloadResource } from "@/data/hooks/useDownloads";
import { useResources } from "@/data/hooks/useResources";
import type { Resource } from "@/data/types/resources.types";
import { ResourceUploadDialog } from "@/features/resources/components/ResourceUploadDialog";
import { MentorResourceTable } from "@/features/resources/components/MentorResourceTable";

const MentorResourcesPage = () => {
  const { toast } = useToast();
  const { data: resources = [], isLoading } = useResources();
  const downloadResource = useDownloadResource();
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  const typedResources = resources as Resource[];

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Resources</h1>
        <ResourceUploadDialog />
      </div>

      <MentorResourceTable
        resources={typedResources}
        isLoading={isLoading}
        downloadingFileId={downloadingFileId}
        onViewFile={handleViewFile}
      />
    </div>
  );
};

export default MentorResourcesPage;
