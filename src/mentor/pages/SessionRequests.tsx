import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import apiService from "@/services/api";

type RequestStatus = "pending" | "approved" | "rejected";

interface SessionRequest {
  id: string;
  topic: string;
  preferred_time: string; // ISO or HH:MM
  preferred_date: string; // YYYY-MM-DD
  comments?: string;
  mentee_id: string;
  mentee_name: string;
  mentee_reg: string;
  created_at: string;
  status: RequestStatus;
}

const formatDMY = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}-${m}-${y}`;
};

const SessionRequestsPage = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RequestStatus>("approved");
  const [viewing, setViewing] = useState<SessionRequest | null>(null);
  const [teamsLink, setTeamsLink] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getSessionRequests().catch(() => []);
        setRequests(Array.isArray(data) ? data : []);
      } catch (e) {
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(
    () => requests.filter((r) => r.status === activeTab),
    [requests, activeTab]
  );

  const updateStatusLocally = (id: string, status: RequestStatus) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const handleApprove = async (req: SessionRequest) => {
    try {
      await apiService.updateSessionRequestStatus(req.id, "approved", teamsLink || undefined);
      updateStatusLocally(req.id, "approved");
      toast({ title: "Approved", description: "Session request approved" });
      setTeamsLink("");
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to approve" });
    }
  };

  const handleReject = async (req: SessionRequest) => {
    try {
      await apiService.updateSessionRequestStatus(req.id, "rejected");
      updateStatusLocally(req.id, "rejected");
      toast({ title: "Rejected", description: "Session request rejected" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to reject" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Session Requests</h1>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RequestStatus)}>
        <TabsList className="mb-4">
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card className="p-4">
            {isLoading ? (
              <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                Loading requests...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Preferred</TableHead>
                    <TableHead>Mentee</TableHead>
                    <TableHead>Requested On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No {activeTab} requests
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="max-w-[240px] truncate">{req.topic}</TableCell>
                        <TableCell>
                          {formatDMY(req.preferred_date)} {req.preferred_time}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{req.mentee_reg}</Badge>
                            <span className="truncate max-w-[160px]">{req.mentee_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDMY(req.created_at)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setViewing(req)}>
                            View
                          </Button>
                          {activeTab === "pending" && (
                            <>
                              <Button size="sm" onClick={() => handleApprove(req)}>Approve</Button>
                              <Button variant="destructive" size="sm" onClick={() => handleReject(req)}>Reject</Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Topic</div>
                <div className="text-sm font-medium">{viewing.topic}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Preferred Date</div>
                  <div className="text-sm font-medium">{formatDMY(viewing.preferred_date)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Preferred Time</div>
                  <div className="text-sm font-medium">{viewing.preferred_time}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Mentee</div>
                <div className="text-sm font-medium">{viewing.mentee_name} ({viewing.mentee_reg})</div>
              </div>
              {viewing.comments && (
                <div>
                  <div className="text-sm text-muted-foreground">Comments</div>
                  <div className="text-sm">{viewing.comments}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">Teams Meeting Link (optional)</div>
                <Input
                  placeholder="https://teams.microsoft.com/..."
                  value={teamsLink}
                  onChange={(e) => setTeamsLink(e.target.value)}
                />
              </div>
              {viewing.status === "pending" && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button onClick={() => { handleApprove(viewing); setViewing(null); }}>Approve</Button>
                  <Button variant="destructive" onClick={() => { handleReject(viewing); setViewing(null); }}>Reject</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionRequestsPage;


