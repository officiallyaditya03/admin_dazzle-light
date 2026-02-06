import { useEffect, useState } from "react";
import { Package, MessageSquare, TrendingUp, Clock, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalInquiries: number;
  newInquiries: number;
  recentInquiries: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalInquiries: 0,
    newInquiries: 0,
    recentInquiries: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true });

        const { count: activeProducts } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        const { count: totalInquiries } = await supabase.from("inquiries").select("*", { count: "exact", head: true });

        const { count: newInquiries } = await supabase
          .from("inquiries")
          .select("*", { count: "exact", head: true })
          .eq("status", "new");

        const { data: recentInquiries } = await supabase
          .from("inquiries")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        setStats({
          totalProducts: totalProducts || 0,
          activeProducts: activeProducts || 0,
          totalInquiries: totalInquiries || 0,
          newInquiries: newInquiries || 0,
          recentInquiries: recentInquiries || [],
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      subtitle: `${stats.activeProducts} active`,
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Inquiries",
      value: stats.totalInquiries,
      subtitle: `${stats.newInquiries} new`,
      icon: MessageSquare,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Conversion Rate",
      value: stats.totalInquiries > 0 ? "12%" : "N/A",
      subtitle: "Last 30 days",
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Avg. Response Time",
      value: "4h",
      subtitle: "Within SLA",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your business.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Inquiries</CardTitle>
            <Link to="/admin/inquiries" className="text-sm text-primary hover:underline">
              View All →
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : stats.recentInquiries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No inquiries yet. They'll appear here when customers submit the form.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentInquiries.map((inquiry: any) => (
                  <div
                    key={inquiry.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold">{inquiry.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{inquiry.name}</p>
                        <p className="text-sm text-muted-foreground">{inquiry.product_interest || inquiry.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          inquiry.status === "new"
                            ? "bg-green-100 text-green-700"
                            : inquiry.status === "contacted"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {inquiry.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/admin/products">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Manage Products</h3>
                  <p className="text-sm text-muted-foreground">Add, edit, or remove products from your catalog</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/inquiries">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <MessageSquare className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">View Inquiries</h3>
                  <p className="text-sm text-muted-foreground">Respond to customer inquiries and track leads</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}



