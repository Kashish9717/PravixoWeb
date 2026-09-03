import { useEffect, useState } from "react";
import { resolveImageUrl } from "@/lib/utils";
import { Search, Trash2, MoreHorizontal, ArrowUpDown } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatNumber } from "@/lib/format";

export function UsersPage() {
  useEffect(() => {
    document.title = "Users —  Pravixo Admin";
  }, []);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleteReason, setDeleteReason] = useState("");

  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendName, setSuspendName] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("7");
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);

  const [profiles, setProfiles] = useState(null);

  const fetchProfiles = async () => {
    try {
      const res = await api.get("/admin/profiles");
      if (res.data.success) {
        let data = res.data.data;
        if (search) {
          data = data.filter(p => p.fullName?.toLowerCase().includes(search.toLowerCase()) || p.handle?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));
        }
        if (roleFilter) {
          data = data.filter(p => p.role === roleFilter);
        }
        setProfiles(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [search, roleFilter]);

  const handleDelete = async (e) => {
    if (e) e.preventDefault();
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/profiles/${deleteTarget}`, { data: { reason: deleteReason } });
      toast.success(`Deleted ${deleteName}`);
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
    setDeleteTarget(null);
    setDeleteName("");
    setDeleteReason("");
  };

  const handleSuspend = async (e) => {
    e.preventDefault();
    if (!suspendTarget) return;
    try {
      const days = parseInt(suspendDuration, 10);
      if (isNaN(days) || days <= 0) {
        toast.error("Please enter a valid number of days.");
        return;
      }
      await api.post(`/admin/profiles/${suspendTarget}/suspend`, {
        reason: suspendReason,
        durationDays: days,
      });
      toast.success(`Suspended ${suspendName} for ${days} days.`);
      setIsSuspendDialogOpen(false);
      setSuspendTarget(null);
      setSuspendReason("");
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to suspend user");
    }
  };

  const handleUnsuspend = async (id, name) => {
    try {
      await api.post(`/admin/profiles/${id}/unsuspend`);
      toast.success(`Restored access for ${name}`);
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to unsuspend user");
    }
  };

  const handleRoleSwitch = async (id, newRole, name) => {
    try {
      await api.patch(`/admin/profiles/${id}/role`, { role: newRole });
      toast.success(`${name} is now a ${newRole}`);
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all platform users — creators and brands
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, handle, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["", "creator", "brand"].map((r) => (
            <Button
              key={r}
              size="sm"
              variant={roleFilter === r ? "default" : "outline"}
              className={`rounded-full ${roleFilter === r ? "gradient-sunset border-0 text-white" : ""}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === "" ? "All" : r === "creator" ? "Creators" : "Brands"}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-3xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Followers
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!profiles ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <p className="text-sm text-muted-foreground">
                    No users found
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((u) => {
                const totalFollowers =
                  (u.instagramFollowers || 0) +
                  (u.facebookFollowers || 0) +
                  (u.linkedinFollowers || 0) +
                  (u.youtubeFollowers || 0) +
                  (u.quoraFollowers || 0) +
                  (u.twitterFollowers || 0);

                return (
                  <TableRow key={u._id} className="group">
                    <TableCell className="pl-6 min-w-[200px]">
                      <button
                        onClick={() => window.open(`http://localhost:5173/${u.role === 'creator' ? 'influencer' : 'brand'}/${u._id}`, '_blank')}
                        className="w-full text-left flex items-center gap-3 cursor-pointer group"
                      >
                        <img
                          src={resolveImageUrl(u.avatarUrl, u.fullName || "User")}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || "User")}&background=random`;
                          }}
                          alt=""
                          className="h-10 w-10 rounded-full border border-border object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold truncate group-hover:underline group-hover:text-primary">
                            {u.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {u.handle ? `@${u.handle}` : u.userId?.slice(0, 16) + "…"}
                          </div>
                        </div>
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={`rounded-full text-[10px] ${
                            u.role === "creator"
                              ? "bg-violet/10 text-violet"
                              : "bg-amber/10 text-amber"
                          }`}
                        >
                          {u.role}
                        </Badge>
                        {u.isSuspended && u.suspendedUntil && u.suspendedUntil > Date.now() && (
                          <Badge
                            variant="destructive"
                            className="rounded-full text-[10px] bg-red-500/10 text-red-600 hover:bg-red-500/10 border border-red-500/20 font-semibold"
                          >
                            Suspended
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.category || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.location || "—"}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatNumber(totalFollowers)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg cursor-pointer"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-xl"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() =>
                              handleRoleSwitch(
                                u._id,
                                u.role === "creator" ? "brand" : "creator",
                                u.fullName,
                              )
                            }
                          >
                            Switch to{" "}
                            {u.role === "creator" ? "brand" : "creator"}
                          </DropdownMenuItem>

                          {u.isSuspended && u.suspendedUntil && u.suspendedUntil > Date.now() ? (
                            <DropdownMenuItem
                              className="text-emerald-600 focus:text-emerald-600 cursor-pointer"
                              onClick={() => handleUnsuspend(u._id, u.fullName)}
                            >
                              Unsuspend user
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-amber-600 focus:text-amber-600 cursor-pointer"
                              onClick={() => {
                                setSuspendTarget(u._id);
                                setSuspendName(u.fullName);
                                setSuspendReason("");
                                setSuspendDuration("7");
                                setIsSuspendDialogOpen(true);
                              }}
                            >
                              Suspend user
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => {
                              setDeleteTarget(u._id);
                              setDeleteName(u.fullName);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {profiles && (
          <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
            Showing {profiles.length} user{profiles.length !== 1 && "s"}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-destructive">
              Delete user "{deleteName}"?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              This will permanently delete this user and all associated data including portfolio images, conversations, and favorites. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDelete} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="deleteReason">Reason for Deletion (Optional)</Label>
              <textarea
                id="deleteReason"
                rows={3}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g. Fraudulent activity, requested by user"
                className="w-full min-h-[80px] rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-destructive"
              />
            </div>
            
            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-glow"
              >
                Delete permanently
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Suspend "{suspendName}"
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Temporarily restrict this user's access to the platform.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSuspend} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="suspendReason">Reason for Suspension</Label>
              <textarea
                id="suspendReason"
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Inappropriate content, violating campaign agreements"
                className="w-full min-h-[80px] rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="suspendDuration">Suspension Duration (Days)</Label>
              <Input
                id="suspendDuration"
                type="number"
                min="1"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(e.target.value)}
                placeholder="Number of days"
                className="rounded-xl border-border bg-background"
                required
              />
            </div>

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() => {
                  setIsSuspendDialogOpen(false);
                  setSuspendTarget(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-glow"
              >
                Confirm Suspension
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
