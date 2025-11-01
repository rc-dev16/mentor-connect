import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import apiService from "@/services/api";

interface Resource {
  id: string;
  title: string;
  url: string;
  description?: string;
  created_at: string;
}

const MentorResourcesPage = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", description: "" });

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await (apiService as any).getResourcesForMentor?.();
      setResources(Array.isArray(data) ? data : []);
    } catch (e) {
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    try {
      if (!form.title || !form.url) {
        toast({ variant: "destructive", title: "Missing fields", description: "Title and URL are required" });
        return;
      }
      await (apiService as any).createResource?.({ title: form.title, url: form.url, description: form.description });
      toast({ title: "Resource added" });
      setOpen(false);
      setForm({ title: "", url: "", description: "" });
      await load();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add resource" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Resources</h1>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm({ title: "", url: "", description: "" }); }}>
          <DialogTrigger asChild>
            <Button>Add Resource</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <div className="text-sm mb-1">Title</div>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. DSA Notes - Arrays" />
              </div>
              <div>
                <div className="text-sm mb-1">URL</div>
                <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <div className="text-sm mb-1">Description (optional)</div>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description to help mentees" />
              </div>
              <div className="flex justify-end gap-2">
                <Button onClick={onCreate}>Save</Button>
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
                <TableHead>Description</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No resources yet</TableCell>
                </TableRow>
              ) : (
                resources.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[260px] truncate">{r.title}</TableCell>
                    <TableCell className="max-w-[360px] truncate text-muted-foreground">{r.description || "-"}</TableCell>
                    <TableCell>
                      <Button asChild variant="link" className="p-0">
                        <a href={r.url} target="_blank" rel="noopener noreferrer">Open</a>
                      </Button>
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

      <div className="text-xs text-muted-foreground">Note: File uploads can be added later; for now share links (Drive, GitHub, etc.).</div>
    </div>
  );
};

export default MentorResourcesPage;


