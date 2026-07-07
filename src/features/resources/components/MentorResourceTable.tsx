import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Link as LinkIcon } from "lucide-react";
import type { Resource } from "@/data/types/resources.types";

type MentorResourceTableProps = {
  resources: Resource[];
  isLoading: boolean;
  downloadingFileId: string | null;
  onViewFile: (resource: Resource) => void;
};

export function MentorResourceTable({
  resources,
  isLoading,
  downloadingFileId,
  onViewFile,
}: MentorResourceTableProps) {
  return (
    <Card className="p-4">
      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">Loading resources...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Link/File</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No resources yet</TableCell>
              </TableRow>
            ) : (
              resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="max-w-[260px] truncate">{resource.title}</TableCell>
                  <TableCell>
                    {resource.resource_type === "file" ? (
                      <span className="inline-flex items-center gap-1 text-sm">
                        <FileText className="h-4 w-4" />
                        File
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm">
                        <LinkIcon className="h-4 w-4" />
                        Link
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[360px] truncate text-muted-foreground">{resource.description || "-"}</TableCell>
                  <TableCell>
                    {resource.resource_type === "file" ? (
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => onViewFile(resource)}
                        disabled={downloadingFileId === resource.id}
                      >
                        <FileText className="h-4 w-4 mr-1 inline" />
                        {downloadingFileId === resource.id ? "Loading..." : "View File"}
                      </Button>
                    ) : (
                      <Button asChild variant="link" className="p-0">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <LinkIcon className="h-4 w-4 mr-1 inline" />
                          Open Link
                        </a>
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>{new Date(resource.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right" />
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
