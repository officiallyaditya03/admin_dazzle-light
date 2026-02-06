import { useEffect, useState } from "react";
import { Search, Filter, MoreHorizontal, Eye, Phone, Mail, Calendar, StickyNote, Download, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

type InquiryStatus = "new" | "contacted" | "negotiating" | "quoted" | "won" | "lost" | "closed";

const INQUIRY_STATUSES: InquiryStatus[] = ["new", "contacted", "negotiating", "quoted", "won", "lost", "closed"];

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  product_interest: string | null;
  quantity: number | null;
  status: InquiryStatus;
  priority: string | null;
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<InquiryStatus, string> = {
  new: "bg-green-100 text-green-700",
  contacted: "bg-blue-100 text-blue-700",
  negotiating: "bg-purple-100 text-purple-700",
  quoted: "bg-amber-100 text-amber-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
  closed: "bg-gray-100 text-gray-700",
};

const priorityOptions = ["low", "normal", "high", "urgent"];

export default function AdminInquiries() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchInquiries = async () => {
    try {
      let query = supabase.from("inquiries").select("*").order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as InquiryStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setInquiries((data as Inquiry[]) || []);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching inquiries:", error);
      toast({ variant: "destructive", title: "Failed to load inquiries" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleOpenDetail = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setNotes(inquiry.notes || "");
    setFollowUpDate(inquiry.follow_up_date || "");
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    try {
      const { error } = await supabase.from("inquiries").update({ status: newStatus }).eq("id", inquiryId);
      if (error) throw error;
      toast({ title: `Status updated to ${newStatus}` });
      fetchInquiries();

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error updating status:", error);
      toast({ variant: "destructive", title: "Failed to update status" });
    }
  };

  const handlePriorityChange = async (inquiryId: string, priority: string) => {
    try {
      const { error } = await supabase.from("inquiries").update({ priority }).eq("id", inquiryId);
      if (error) throw error;
      toast({ title: `Priority updated to ${priority}` });
      fetchInquiries();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error updating priority:", error);
      toast({ variant: "destructive", title: "Failed to update priority" });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("inquiries")
        .update({ notes, follow_up_date: followUpDate || null })
        .eq("id", selectedInquiry.id);

      if (error) throw error;
      toast({ title: "Notes saved" });
      fetchInquiries();
      setSelectedInquiry({ ...selectedInquiry, notes, follow_up_date: followUpDate || null });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error saving notes:", error);
      toast({ variant: "destructive", title: "Failed to save notes" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ["Name", "Email", "Phone", "Company", "Product", "Quantity", "Status", "Priority", "Date"],
      ...inquiries.map((i) => [
        i.name,
        i.email,
        i.phone || "",
        i.company || "",
        i.product_interest || "",
        i.quantity?.toString() || "",
        i.status,
        i.priority || "",
        new Date(i.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredInquiries = inquiries.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.product_interest?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inquiries</h1>
            <p className="text-muted-foreground">Track and manage customer inquiries ({inquiries.length} total)</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search inquiries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {INQUIRY_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : filteredInquiries.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-1">No inquiries found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== "all" ? "Try a different filter" : "Inquiries will appear here when customers submit the form"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Qty</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Priority</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-foreground">{inquiry.name}</p>
                            <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                            {inquiry.company && <p className="text-xs text-muted-foreground">{inquiry.company}</p>}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{inquiry.product_interest || "-"}</td>
                        <td className="p-4 text-muted-foreground">{inquiry.quantity?.toLocaleString() || "-"}</td>
                        <td className="p-4">
                          <Select value={inquiry.status} onValueChange={(v) => handleStatusChange(inquiry.id, v as InquiryStatus)}>
                            <SelectTrigger className="w-[130px] h-8">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inquiry.status]}`}>{inquiry.status}</span>
                            </SelectTrigger>
                            <SelectContent>
                              {INQUIRY_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4">
                          <Select value={inquiry.priority || "normal"} onValueChange={(v) => handlePriorityChange(inquiry.id, v)}>
                            <SelectTrigger className="w-[100px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {priorityOptions.map((p) => (
                                <SelectItem key={p} value={p}>
                                  {p.charAt(0).toUpperCase() + p.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">{new Date(inquiry.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDetail(inquiry)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`mailto:${inquiry.email}`)}>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              {inquiry.phone && (
                                <DropdownMenuItem onClick={() => window.open(`tel:${inquiry.phone}`)}>
                                  <Phone className="w-4 h-4 mr-2" />
                                  Call
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
            </DialogHeader>
            {selectedInquiry && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Customer Name</label>
                      <p className="font-medium">{selectedInquiry.name}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Email</label>
                      <p className="font-medium">{selectedInquiry.email}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Phone</label>
                      <p className="font-medium">{selectedInquiry.phone || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Company</label>
                      <p className="font-medium">{selectedInquiry.company || "-"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Product Interest</label>
                      <p className="font-medium">{selectedInquiry.product_interest || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Quantity</label>
                      <p className="font-medium">{selectedInquiry.quantity?.toLocaleString() || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Select value={selectedInquiry.status} onValueChange={(v) => handleStatusChange(selectedInquiry.id, v as InquiryStatus)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INQUIRY_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Submitted</label>
                      <p className="font-medium">{new Date(selectedInquiry.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Message</label>
                  <div className="mt-1 p-3 rounded-lg bg-muted/50 text-sm">{selectedInquiry.message || "No message provided"}</div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <StickyNote className="w-4 h-4" />
                    CRM Notes
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Internal Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this inquiry..."
                      className="mt-1 flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Follow-up Date
                    </label>
                    <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="mt-1" />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotes} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Notes"}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => window.open(`mailto:${selectedInquiry.email}`)}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  {selectedInquiry.phone && (
                    <Button variant="outline" onClick={() => window.open(`tel:${selectedInquiry.phone}`)}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}



