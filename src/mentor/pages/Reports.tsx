import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useMentees, useProfile } from "@/data/hooks/useProfile";
import { useMeetings } from "@/data/hooks/useMeetings";
import { meetingsApi } from "@/data/api/meetings.api";

type ReportType = "group";
type TimeRange = "this_month" | "semester" | "custom";

interface MenteeLite {
  id: string;
  name: string;
  registration_number: string;
}

interface MeetingLite {
  id: string;
  meeting_date: string;
  meeting_time: string;
  title?: string;
  topic?: string;
  status: string;
}

const formatDMY = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}-${m}-${y}`;
};

const toCSV = (rows: Record<string, string>[], headers: string[]) => {
  const esc = (v: unknown) => `"${String(v ?? "").split('"').join('""')}"`;
  const head = headers.map(esc).join(",");
  const body = rows.map((r) => headers.map((h) => esc(r[h])).join(",")).join("\n");
  return `${head}\n${body}`;
};

const download = (filename: string, content: string, type = "text/csv") => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const ReportsPage = () => {
  const { toast } = useToast();
  const { data: menteesData = [] } = useMentees();
  const { data: meetingsData = [] } = useMeetings();
  const { data: profile } = useProfile();

  const [reportType] = useState<ReportType>("group");
  const [timeRange, setTimeRange] = useState<TimeRange>("this_month");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(false);

  const mentees = useMemo<MenteeLite[]>(
    () =>
      (menteesData as { id: string; name: string; registration_number: string }[]).map((m) => ({
        id: m.id,
        name: m.name,
        registration_number: m.registration_number,
      })),
    [menteesData]
  );

  const meetings = meetingsData as MeetingLite[];
  const mentorName = profile?.name || "";
  const mentorEmail = profile?.email || "";

  const applyTimeRange = useMemo(() => {
    const today = new Date();
    if (timeRange === "this_month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: start, to: end };
    }
    if (timeRange === "semester") {
      const m = today.getMonth();
      if (m >= 7) {
        return { from: new Date(today.getFullYear(), 7, 1), to: new Date(today.getFullYear(), 11, 31) };
      }
      return { from: new Date(today.getFullYear(), 0, 1), to: new Date(today.getFullYear(), 4, 31) };
    }
    const from = fromDate ? new Date(fromDate + "T00:00:00") : new Date(0);
    const to = toDate ? new Date(toDate + "T23:59:59") : new Date(8640000000000000);
    return { from, to };
  }, [timeRange, fromDate, toDate]);

  const withinRange = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d >= applyTimeRange.from && d <= applyTimeRange.to;
  };

  const generate = async () => {
    try {
      setLoading(true);
      if (reportType === "group") {
        const selectedMeetings = meetings.filter(
          (m) => withinRange(m.meeting_date) && m.status === "completed"
        );
        const details = await Promise.all(selectedMeetings.map((m) => meetingsApi.getMeeting(m.id)));

        const menteeMap: Record<string, { name: string; reg: string; attended: number; total: number; personal: number }> = {};
        mentees.forEach((mn) => {
          menteeMap[mn.id] = {
            name: mn.name,
            reg: mn.registration_number,
            attended: 0,
            total: details.length,
            personal: 0,
          };
        });

        details.forEach((d: { attendance?: { attended?: boolean; mentee_id: string }[] }) => {
          const isPersonal = Array.isArray(d.attendance) && d.attendance.length === 1;
          const presentIds = new Set(
            (d.attendance || []).filter((a) => a.attended).map((a) => a.mentee_id)
          );
          presentIds.forEach((mid) => {
            if (menteeMap[mid]) {
              menteeMap[mid].attended += 1;
              if (isPersonal) menteeMap[mid].personal += 1;
            }
          });
        });

        const table = Object.values(menteeMap).map((v) => ({
          "Mentee Name": v.name,
          "Reg. No.": v.reg,
          "Gen. Meetings Attended": `${Math.max(v.attended - v.personal, 0)} / ${Math.max(v.total - v.personal, 0)}`,
          "Personal Sessions": `${v.personal}`,
          "Total Meetings": `${v.attended} / ${v.total}`,
          "Attendance %": v.total ? `${Math.round((v.attended / v.total) * 100)}%` : "-",
        }));
        setRows(table);
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to generate report" });
    } finally {
      setLoading(false);
    }
  };

  const headers = useMemo(() => (rows[0] ? Object.keys(rows[0]) : []), [rows]);

  const exportCSV = () => {
    if (!rows.length) return;
    const csv = toCSV(rows, headers);
    download(`report-${reportType}.csv`, csv);
  };

  const printPDF = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Whole Group Report (Till Date / End of Semester)</p>
        </div>
        <div className="text-sm text-muted-foreground">
          <div><span className="font-medium text-foreground">Mentor:</span> {mentorName || "-"}</div>
          <div className="truncate"><span className="font-medium text-foreground">Email:</span> {mentorEmail || "-"}</div>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-1">
            <div className="text-sm mb-1">Report Type</div>
            <Button variant="outline" className="w-full justify-start">Group Report</Button>
          </div>

          <div className="md:col-span-1">
            <div className="text-sm mb-1">Time Range</div>
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="semester">Semester</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {timeRange === "custom" && (
            <>
              <div>
                <div className="text-sm mb-1">From</div>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div>
                <div className="text-sm mb-1">To</div>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </>
          )}

          <div className="md:col-span-1 flex items-end">
            <Button className="w-full" onClick={generate} disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        {rows.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">No data</div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-2">
              Period:{" "}
              {formatDMY(
                String(
                  new Date(
                    Math.min(
                      ...(meetings
                        .filter((m) => withinRange(m.meeting_date))
                        .map((m) => new Date(m.meeting_date).getTime()) || [Date.now()])
                    )
                  )
                )
              )}{" "}
              – {formatDMY(String(applyTimeRange.to.toISOString()))}
            </div>
            <div className="flex items-center justify-end gap-2 mb-3">
              <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
              <Button onClick={printPDF}>Download PDF</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(rows[0]).map((k) => (
                    <TableHead key={k}>{k.split("_").join(" ")}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    {Object.keys(rows[0]).map((k) => (
                      <TableCell key={k}>{r[k]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Card>
    </div>
  );
};

export default ReportsPage;
