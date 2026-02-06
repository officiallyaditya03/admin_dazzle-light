import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Mail,
  User,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";

interface AdminRequest {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export default function AdminApprovals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogType, setDialogType] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("admin_requests").select("*").order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      setRequests((data as AdminRequest[]) || []);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching requests:", error);
      toast({ variant: "destructive", title: "Failed to load requests" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !user) return;

    setIsProcessing(true);
    try {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: selectedRequest.user_id, role: "admin" });
      if (roleError) throw roleError;

      const { error: updateError } = await supabase
        .from("admin_requests")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);
      if (updateError) throw updateError;

      toast({
        title: "Request Approved",
        description: `${selectedRequest.full_name} now has admin access.`,
      });

      fetchRequests();
      setDialogType(null);
      setSelectedRequest(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error approving request:", error);
      toast({ variant: "destructive", title: "Failed to approve request" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !user) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("admin_requests")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectReason || null,
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: `${selectedRequest.full_name}'s request has been rejected.`,
      });

      fetchRequests();
      setDialogType(null);
      setSelectedRequest(null);
      setRejectReason("");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error rejecting request:", error);
      toast({ variant: "destructive", title: "Failed to reject request" });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Approvals</h1>
            <p className="text-muted-foreground">Review and approve admin access requests</p>
          </div>
          {pendingCount > 0 && <Badge className="bg-amber-500 text-white">{pendingCount} pending</Badge>}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <UserCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No admin requests found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl border border-border p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{request.full_name}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {request.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {request.rejection_reason && (
                        <p className="text-sm text-red-600 mt-2">
                          <strong>Rejection reason:</strong> {request.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex items-center gap-2 ml-16 lg:ml-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setSelectedRequest(request);
                          setDialogType("reject");
                        }}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedRequest(request);
                          setDialogType("approve");
                        }}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogType === "approve"} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Admin Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to grant admin access to <strong>{selectedRequest?.full_name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogType === "reject"} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Admin Request</DialogTitle>
            <DialogDescription>
              Reject the admin access request from <strong>{selectedRequest?.full_name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-3">
            <label className="text-sm font-medium">Rejection Reason (optional)</label>
            <Textarea
              placeholder="Provide a reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
              {isProcessing ? "Rejecting..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}


