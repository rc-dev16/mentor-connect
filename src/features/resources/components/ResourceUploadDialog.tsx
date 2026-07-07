import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Link as LinkIcon, X } from "lucide-react";
import { useResourceMutations } from "@/data/hooks/mutations/useResourceMutations";
import { formatFileSize } from "@/features/resources/lib/format-file-size";

export function ResourceUploadDialog() {
  const { toast } = useToast();
  const createResource = useResourceMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<"file" | "link">("file");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Only PDF and Word documents (.pdf, .doc, .docx) are allowed",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "File size must be less than 10MB",
      });
      return;
    }
    setSelectedFile(file);
  };

  const resetForm = () => {
    setForm({ title: "", url: "", description: "" });
    setSelectedFile(null);
    setUploadType("file");
  };

  const onCreate = async () => {
    try {
      if (!form.title) {
        toast({ variant: "destructive", title: "Missing fields", description: "Title is required" });
        return;
      }

      if (uploadType === "file" && !selectedFile) {
        toast({ variant: "destructive", title: "Missing file", description: "Please select a file to upload" });
        return;
      }

      if (uploadType === "link" && !form.url) {
        toast({ variant: "destructive", title: "Missing URL", description: "Please provide a URL" });
        return;
      }

      await createResource.mutateAsync({
        title: form.title,
        description: form.description,
        url: uploadType === "link" ? form.url : undefined,
        file: uploadType === "file" ? selectedFile ?? undefined : undefined,
        is_public: false,
      });

      toast({
        title: "Resource added",
        description: uploadType === "file" ? "File uploaded successfully" : "Link added successfully",
      });
      setOpen(false);
      resetForm();
    } catch (e: unknown) {
      console.error("Error creating resource:", e);
      toast({
        variant: "destructive",
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to add resource",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>Add Resource</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as "file" | "link")}>
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
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <div className="mt-2 p-2 bg-muted rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">({formatFileSize(selectedFile.size)})</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
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
            <Button onClick={onCreate} disabled={createResource.isPending}>
              {createResource.isPending ? "Uploading..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
