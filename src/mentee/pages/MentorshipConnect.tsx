import { Calendar, Clock, CalendarIcon, Clock3 } from "lucide-react";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as UiCalendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import apiService from "@/services/api";
import { useEffect as useEffect2, useState } from "react";

const MentorshipConnect = () => {
  useEffect(() => {
    try {
      const userType = localStorage.getItem('userType');
      const userInfo = localStorage.getItem('userInfo');
      // Debug route/access context
      console.log('[MentorshipConnect] mounted', {
        path: window.location.pathname,
        userType,
        hasUserInfo: !!userInfo,
      });
    } catch (e) {
      console.error('[MentorshipConnect] localStorage access error', e);
    }
  }, []);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      preferred_date: "",
      preferred_time: "09:00",
      duration_minutes: 30
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const payload: any = { ...data };
      // enforce required date/time
      if (!payload.preferred_date || !payload.preferred_time) {
        console.error('Date and time are required');
        return;
      }
      console.log('[MentorshipConnect] submit request payload', payload);
      await apiService.createSessionRequest(payload);
      const list = await apiService.getSessionRequests();
      setRequests(list);
      form.reset();
      setIsDialogOpen(false);
    } catch (e) {
      console.error('[MentorshipConnect] createSessionRequest error', e);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await apiService.getSessionRequests();
        setRequests(list);
      } catch (e) {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingRequests = [
    {
      id: 1,
      topic: "Career Path Discussion",
      preferredTime: "2025-10-10 14:00",
      status: "Pending",
      requestedOn: "2025-10-01"
    },
    {
      id: 2,
      topic: "Project Guidance",
      preferredTime: "2025-10-12 11:00",
      status: "Pending",
      requestedOn: "2025-10-02"
    }
  ];

  const formatDateDMY = (iso?: string) => {
    if (!iso) return "-";
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}-${m}-${y}`;
  };

  const formatTimeHM = (time?: string) => {
    if (!time) return "";
    return time.slice(0,5);
  };

  // Fix timezone shift when selecting dates: use local YYYY-MM-DD
  const toLocalYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const parseYMDToDate = (ymd?: string) => {
    if (!ymd) return undefined;
    const [y, m, d] = ymd.split('-').map((v) => parseInt(v, 10));
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Mentorship Connect</h1>
          <p className="text-muted-foreground mt-1">Schedule personalized mentoring sessions to discuss your growth and challenges.</p>
        </div>
        
        {/* Request Session Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Calendar className="h-4 w-4" />
              Request Mentorship Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request a Mentorship Session</DialogTitle>
              <DialogDescription>
                Schedule a dedicated one-on-one session with your mentor to discuss your progress and goals.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic for Discussion</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Career Growth Discussion" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferred_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date</FormLabel>
                      <Popover modal={false} open={isDateOpen} onOpenChange={setIsDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? formatDateDMY(field.value) : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <UiCalendar
                            mode="single"
                            selected={parseYMDToDate(field.value)}
                            onSelect={(d) => {
                              field.onChange(d ? toLocalYMD(d) : "");
                              setIsDateOpen(false);
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              const d = new Date(date);
                              d.setHours(0,0,0,0);
                              return d < today; // disable past dates
                            }}
                            classNames={{
                              day_today: "border border-orange-500 text-foreground",
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferred_time"
                  render={({ field }) => {
                    const to24h = (h12: number, minutes: number, period: 'AM' | 'PM') => {
                      let h = h12 % 12;
                      if (period === 'PM') h += 12;
                      return `${String(h).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;
                    };
                    const from24h = (value?: string) => {
                      if (!value) return { h12: 9, minutes: 0, period: 'AM' as 'AM' | 'PM' };
                      const [hStr, mStr] = value.split(':');
                      let h = parseInt(hStr || '9', 10);
                      const minutes = parseInt(mStr || '0', 10);
                      const period = h >= 12 ? 'PM' : 'AM';
                      h = h % 12; if (h === 0) h = 12;
                      return { h12: h, minutes, period };
                    };
                    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
                    const minutesOpts = Array.from({ length: 12 }, (_, i) => i * 5); // 0..55 step 5
                    const state = from24h(field.value);
                    return (
                      <FormItem>
                        <FormLabel>Preferred Time</FormLabel>
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <select
                                className="h-9 rounded-md border bg-background px-2"
                                value={state.h12}
                                onChange={(e) => {
                                  const next = to24h(parseInt(e.target.value,10), state.minutes, (state.period === 'AM' ? 'AM' : 'PM'));
                                  field.onChange(next);
                                }}
                              >
                                {hours.map(h => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                              :
                              <select
                                className="h-9 rounded-md border bg-background px-2"
                                value={state.minutes}
                                onChange={(e) => {
                                  const next = to24h(state.h12, parseInt(e.target.value,10), state.period as 'AM'|'PM');
                                  field.onChange(next);
                                }}
                              >
                                {minutesOpts.map(m => (
                                  <option key={m} value={m}>{String(m).padStart(2,'0')}</option>
                                ))}
                              </select>
                              <select
                                className="h-9 rounded-md border bg-background px-2"
                                value={state.period}
                                onChange={(e) => {
                                  const period = (e.target.value === 'AM' ? 'AM' : 'PM') as 'AM'|'PM';
                                  const next = to24h(state.h12, state.minutes, period);
                                  field.onChange(next);
                                }}
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discussion Points</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List the key points you'd like to discuss..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* mentor inferred from active relationship */}
                <Button type="submit" className="w-full">Submit Request</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Your Session Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">No requests yet</div>
            ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card/40"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium leading-none">{request.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDateDMY(request.preferred_date)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-foreground">
                        <Clock3 className="h-3 w-3" />
                        {formatTimeHM(request.preferred_time)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {request.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                      onClick={async () => {
                        try {
                          await apiService.deleteSessionRequest(request.id);
                          const list = await apiService.getSessionRequests();
                          setRequests(list);
                        } catch (e) {
                          console.error('Cancel request failed', e);
                        }
                      }}
                    >
                      Cancel Request
                    </Button>
                  )}
                  <Badge variant="secondary" className="tracking-wider">
                    {(request.status || '').toString().toUpperCase()}
                  </Badge>
                  {request.status === 'approved' && request.mentor_notes && (
                    <Button
                      size="sm"
                      onClick={() => window.open(request.mentor_notes, '_blank')}
                    >
                      Join
                    </Button>
                  )}
                </div>
              </div>
            )))}
          </div>
        </CardContent>
      </Card>

      {/* Guidelines Card */}
      <Card>
        <CardHeader>
          <CardTitle>Mentorship Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Before Requesting a Session:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Check your mentor's availability in their profile</li>
                <li>Prepare specific topics or questions you want to discuss</li>
                <li>Request sessions at least 2-3 days in advance</li>
                <li>Keep sessions focused on specific goals or challenges</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">During the Session:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Be punctual and prepared with your discussion points</li>
                <li>Take notes of key insights and action items</li>
                <li>Ask specific questions and seek actionable feedback</li>
                <li>Respect the scheduled time duration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorshipConnect;

