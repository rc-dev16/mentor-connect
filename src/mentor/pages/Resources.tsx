import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileText, Link as LinkIcon, X } from "lucide-react";
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

const MentorResourcesPage = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  const load = async () => {
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

  useEffect(() => { load(); }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Only PDF and Word documents (.pdf, .doc, .docx) are allowed"
        });
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "File size must be less than 10MB"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

  const onCreate = async () => {
    try {
      if (!form.title) {
        toast({ variant: "destructive", title: "Missing fields", description: "Title is required" });
        return;
      }

      if (uploadType === 'file' && !selectedFile) {
        toast({ variant: "destructive", title: "Missing file", description: "Please select a file to upload" });
        return;
      }

      if (uploadType === 'link' && !form.url) {
        toast({ variant: "destructive", title: "Missing URL", description: "Please provide a URL" });
        return;
      }

      setIsUploading(true);
      await apiService.createResource({
        title: form.title,
        description: form.description,
        url: uploadType === 'link' ? form.url : undefined,
        file: uploadType === 'file' ? selectedFile : undefined,
        is_public: false // Resources are always private to the mentor's mentees only
      });

      toast({ title: "Resource added", description: uploadType === 'file' ? "File uploaded successfully" : "Link added successfully" });
      setOpen(false);
      setForm({ title: "", url: "", description: "" });
      setSelectedFile(null);
      setUploadType('file');
      await load();
    } catch (e: any) {
      console.error('Error creating resource:', e);
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message || "Failed to add resource"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Resources</h1>

        <Dialog open={open} onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setForm({ title: "", url: "", description: "" });
            setSelectedFile(null);
            setUploadType('file');
          }
        }}>
          <DialogTrigger asChild>
            <Button>Add Resource</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as 'file' | 'link')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="link">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Add Link
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4">
                  <div>
                    <div className="text-sm mb-1">Title</div>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. DSA Notes - Arrays"
                    />
                  </div>
                  <div>
                    <div className="text-sm mb-1">File (PDF or Word Document)</div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                      />
                    </div>
                    {selectedFile && (
                      <div className="mt-2 p-2 bg-muted rounded-md flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{selectedFile.name}</span>
                          <span className="text-xs text-muted-foreground">({formatFileSize(selectedFile.size)})</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported formats: PDF, DOC, DOCX (Max 10MB)
                    </p>
                  </div>
                  <div>
                    <div className="text-sm mb-1">Description (optional)</div>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Short description to help mentees"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="link" className="space-y-4">
                  <div>
                    <div className="text-sm mb-1">Title</div>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. DSA Notes - Arrays"
                    />
                  </div>
                  <div>
                    <div className="text-sm mb-1">URL</div>
                    <Input
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <div className="text-sm mb-1">Description (optional)</div>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Short description to help mentees"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
                <p className="font-medium mb-1">Resource Visibility</p>
                <p>This resource will only be visible to your assigned mentees.</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={onCreate} disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                resources.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[260px] truncate">{r.title}</TableCell>
                    <TableCell>
                      {r.resource_type === 'file' ? (
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
                    <TableCell className="max-w-[360px] truncate text-muted-foreground">{r.description || "-"}</TableCell>
                    <TableCell>
                      {r.resource_type === 'file' ? (
                        <Button
                          variant="link"
                          className="p-0"
                          onClick={() => handleViewFile(r)}
                          disabled={downloadingFileId === r.id}
                        >
                          <FileText className="h-4 w-4 mr-1 inline" />
                          {downloadingFileId === r.id ? "Loading..." : "View File"}
                        </Button>
                      ) : (
                        <Button asChild variant="link" className="p-0">
                          <a href={r.url} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="h-4 w-4 mr-1 inline" />
                            Open Link
                          </a>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {/* Future: delete/edit */}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

    </div>
  );
};

export default MentorResourcesPage;


