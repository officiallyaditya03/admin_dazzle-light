// Database types for admin panel
// If you have a generated Supabase types file, you can replace this with the generated one.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type InquiryStatus = "new" | "contacted" | "negotiating" | "quoted" | "won" | "lost" | "closed";

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          sku: string | null;
          category: string;
          subcategory: string | null;
          description: string | null;
          price: number;
          mrp: number | null;
          wattage: number | null;
          lumens: number | null;
          color_temperature: string | null;
          shape: string | null;
          mounting_type: string | null;
          material: string | null;
          ip_rating: string | null;
          voltage: string | null;
          warranty: string | null;
          moq: number | null;
          certifications: string[] | null;
          image_url: string | null;
          is_featured: boolean | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sku?: string | null;
          category: string;
          subcategory?: string | null;
          description?: string | null;
          price: number;
          mrp?: number | null;
          wattage?: number | null;
          lumens?: number | null;
          color_temperature?: string | null;
          shape?: string | null;
          mounting_type?: string | null;
          material?: string | null;
          ip_rating?: string | null;
          voltage?: string | null;
          warranty?: string | null;
          moq?: number | null;
          certifications?: string[] | null;
          image_url?: string | null;
          is_featured?: boolean | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sku?: string | null;
          category?: string;
          subcategory?: string | null;
          description?: string | null;
          price?: number;
          mrp?: number | null;
          wattage?: number | null;
          lumens?: number | null;
          color_temperature?: string | null;
          shape?: string | null;
          mounting_type?: string | null;
          material?: string | null;
          ip_rating?: string | null;
          voltage?: string | null;
          warranty?: string | null;
          moq?: number | null;
          certifications?: string[] | null;
          image_url?: string | null;
          is_featured?: boolean | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inquiries: {
        Row: {
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
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          message: string;
          product_interest?: string | null;
          quantity?: number | null;
          status?: InquiryStatus;
          priority?: string | null;
          notes?: string | null;
          follow_up_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          message?: string;
          product_interest?: string | null;
          quantity?: number | null;
          status?: InquiryStatus;
          priority?: string | null;
          notes?: string | null;
          follow_up_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_requests: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          email: string;
          status: "pending" | "approved" | "rejected";
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          email: string;
          status?: "pending" | "approved" | "rejected";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          email?: string;
          status?: "pending" | "approved" | "rejected";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
      };
      user_roles: {
        Row: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      inquiry_status: InquiryStatus[];
    };
    CompositeTypes: Record<string, never>;
  };
};

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Export Constants helper for enum access (if needed)
export const Constants = {
  public: {
    Enums: {
      inquiry_status: ["new", "contacted", "negotiating", "quoted", "won", "lost", "closed"] as const,
    },
  },
} as const;
