import { useEffect, useState } from "react";
import { resolveImageUrl } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Eye, MessageSquare, Search } from "lucide-react";
import api from "@/lib/axios";
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

export function ConversationsPage() {
  useEffect(() => {
    document.title = "Conversations —  Pravixo Admin";
  }, []);

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/admin/conversations");
        if (res.data.success) {
          setConversations(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      }
    };
    fetchConversations();
  }, []);

  const filtered = conversations?.filter((c) => {
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const creatorName = c.creator?.fullName?.toLowerCase() || "";
    const brandName = c.brand?.fullName?.toLowerCase() || "";
    const campaignTitle = c.campaign?.title?.toLowerCase() || "";
    const searchLower = search.toLowerCase();

    const matchesSearch = !search ||
      creatorName.includes(searchLower) ||
      brandName.includes(searchLower) ||
      campaignTitle.includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const statusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-600";
      case "pending":
        return "bg-amber/10 text-amber";
      case "completed":
        return "bg-muted text-muted-foreground";
      default:
        return "";
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Conversations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View all platform conversations between creators and brands
        </p>
      </div>

      {/* Filters & Search */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {["", "pending", "active", "completed"].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              className={`rounded-full capitalize ${statusFilter === s ? "gradient-sunset border-0 text-white" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "" ? "All" : s}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by creator, brand or campaign..."
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
              <TableHead className="pl-6">Creator</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Last Message Time</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filtered ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <Skeleton className="h-3.5 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <Skeleton className="h-3.5 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No conversations found
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c._id} className="group">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          resolveImageUrl(c.creator?.avatarUrl, c.creator?.fullName || "C")
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.creator?.fullName || "C")}&background=random`;
                        }}
                        alt=""
                        className="h-10 w-10 rounded-full border border-border object-cover"
                      />
                      <span className="text-sm font-medium">
                        {c.creator?.fullName || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          resolveImageUrl(c.brand?.avatarUrl, c.brand?.fullName || "B")
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.brand?.fullName || "B")}&background=random`;
                        }}
                        alt=""
                        className="h-9 w-9 rounded-full border border-border object-cover"
                      />
                      <span className="text-sm font-medium">
                        {c.brand?.fullName || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {c.campaign?.title || "General"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`rounded-full text-[10px] capitalize ${statusColor(c.status)}`}
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {c.messageCount}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(c.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.lastMessage
                      ? format(new Date(c.lastMessage.createdAt), "MMM d, HH:mm")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end">
                      <Link to={`/messages/${c._id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filtered && (
          <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
            Showing {filtered.length} conversation
            {filtered.length !== 1 && "s"}
          </div>
        )}
      </div>
    </div>
  );
}
