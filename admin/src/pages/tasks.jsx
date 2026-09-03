import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { ClipboardCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export function TasksPage() {
  useEffect(() => {
    document.title = "Tasks Monitoring — Pravixo Admin";
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/admin/tasks");
        if (res.data.success) {
          setTasks(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };
    fetchTasks();
  }, []);

  const filtered = tasks?.filter((t) => {
    const matchesStatus = !statusFilter || t.status === statusFilter;
    const campaignTitle = t.campaign?.title?.toLowerCase() || "";
    const brandName = t.brand?.fullName?.toLowerCase() || "";
    const creatorName = t.creator?.fullName?.toLowerCase() || "";
    const taskTitle = t.title?.toLowerCase() || "";
    const searchLower = search.toLowerCase();

    const matchesSearch =
      !search ||
      campaignTitle.includes(searchLower) ||
      brandName.includes(searchLower) ||
      creatorName.includes(searchLower) ||
      taskTitle.includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "in_progress":
        return "bg-primary/10 text-primary border-primary/20";
      case "revision_requested":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "assigned":
        return "bg-amber/10 text-amber border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getOverdueStatus = (task) => {
    if (task.status === "approved") {
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0">
          On Time / Done
        </Badge>
      );
    }
    const isOverdue = Date.now() > task.dueDate;
    if (isOverdue) {
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-0 font-bold">
          Overdue
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-secondary text-muted-foreground border-0">
        Active
      </Badge>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Task Monitoring
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor all assigned tasks, countdown limits, and deliverables across the platform.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {["", "assigned", "in_progress", "completed", "revision_requested", "approved"].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              className={`rounded-full capitalize text-xs px-3 h-8 ${
                statusFilter === s ? "gradient-sunset border-0 text-white" : ""
              }`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "" ? "All" : s.replace("_", " ")}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaign, creator, brand..."
            className="pl-9 rounded-full bg-secondary/50 border-0 text-xs h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-3xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Campaign</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Task Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started Time</TableHead>
              <TableHead>Completed Time</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right pr-6">Time Limit Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filtered ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right pr-6"><Skeleton className="h-5 w-16 ml-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-16 text-center">
                  <ClipboardCheck className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No tasks found
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t._id}>
                  <TableCell className="pl-6 font-semibold max-w-[150px] truncate">
                    {t.campaign?.title || "General"}
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate">
                    {t.brand?.fullName || "Unknown"}
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate">
                    {t.creator?.fullName || "Unknown"}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {t.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`rounded-full text-[10px] capitalize font-semibold border-0 ${getStatusColor(
                        t.status
                      )}`}
                    >
                      {t.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {t.startedAt ? format(new Date(t.startedAt), "MMM d, HH:mm") : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {t.completedAt ? format(new Date(t.completedAt), "MMM d, HH:mm") : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(t.dueDate), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {getOverdueStatus(t)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filtered && (
          <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
            Showing {filtered.length} task{filtered.length !== 1 && "s"}
          </div>
        )}
      </div>
    </div>
  );
}
