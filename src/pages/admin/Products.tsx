import { useEffect, useState, useRef } from "react";
import { Plus, Search, Edit, Trash2, MoreHorizontal, Package, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import type { Updates, Inserts } from "@/integrations/supabase/database.types";

interface Product {
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
}

const emptyProduct: Partial<Product> = {
  name: "",
  sku: "",
  category: "Panel Lights",
  subcategory: "",
  description: "",
  price: 0,
  mrp: 0,
  wattage: 0,
  lumens: 0,
  color_temperature: "",
  shape: "Round",
  mounting_type: "Recessed",
  material: "",
  ip_rating: "",
  voltage: "220-240V AC",
  warranty: "2 Years",
  moq: 100,
  is_featured: false,
  is_active: true,
};

export default function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>(emptyProduct);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setProducts((data as Product[]) || []);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching products:", error);
      toast({ variant: "destructive", title: "Failed to load products" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData(emptyProduct);
    }
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Please upload an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Image must be less than 5MB" });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast({ title: "Image uploaded successfully" });
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Failed to upload image",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: null });
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.category?.trim()) {
      toast({ variant: "destructive", title: "Name and category are required" });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name!,
        sku: formData.sku || null,
        category: formData.category!,
        subcategory: formData.subcategory || null,
        description: formData.description || null,
        price: formData.price || 0,
        mrp: formData.mrp || null,
        wattage: formData.wattage || null,
        lumens: formData.lumens || null,
        color_temperature: formData.color_temperature || null,
        shape: formData.shape || null,
        mounting_type: formData.mounting_type || null,
        material: formData.material || null,
        ip_rating: formData.ip_rating || null,
        voltage: formData.voltage || null,
        warranty: formData.warranty || null,
        moq: formData.moq || null,
        is_featured: formData.is_featured ?? false,
        is_active: formData.is_active ?? true,
        image_url: formData.image_url || null,
      };

      if (editingProduct?.id) {
        const updatePayload: Updates<"products"> = payload;
        const { error } = await supabase.from("products").update(updatePayload).eq("id", editingProduct.id);
        if (error) throw error;
        toast({ title: "Product updated successfully" });
      } else {
        const insertPayload: Inserts<"products"> = payload;
        const { error } = await supabase.from("products").insert(insertPayload);
        if (error) throw error;
        toast({ title: "Product created successfully" });
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "Failed to save product",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Product deleted" });
      fetchProducts();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error deleting product:", error);
      toast({ variant: "destructive", title: "Failed to delete product" });
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-1">No products found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery ? "Try a different search term" : "Add your first product to get started"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">SKU</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                <Package className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-foreground">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.wattage}W {product.shape}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{product.sku || "-"}</td>
                        <td className="p-4 text-muted-foreground">{product.category}</td>
                        <td className="p-4 font-medium">₹{product.price}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              product.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(product)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild />
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Product Image</label>
                <div className="mt-2">
                  {formData.image_url ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.image_url}
                        alt="Product preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      {isUploading ? (
                        <div className="text-sm text-muted-foreground">Uploading...</div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground">Click to upload</span>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="LED Panel Light 6W"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <Input
                    value={formData.sku || ""}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="DL-PNL-6W-RND"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={formData.category || ""} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Panel Lights">Panel Lights</SelectItem>
                      <SelectItem value="Downlights">Downlights</SelectItem>
                      <SelectItem value="Strip Lights">Strip Lights</SelectItem>
                      <SelectItem value="Bulbs">Bulbs</SelectItem>
                      <SelectItem value="Tube Lights">Tube Lights</SelectItem>
                      <SelectItem value="Flood Lights">Flood Lights</SelectItem>
                      <SelectItem value="Street Lights">Street Lights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Subcategory</label>
                  <Input
                    value={formData.subcategory || ""}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g., Round, COB, Indoor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Shape</label>
                  <Select value={formData.shape || ""} onValueChange={(v) => setFormData({ ...formData, shape: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Round">Round</SelectItem>
                      <SelectItem value="Square">Square</SelectItem>
                      <SelectItem value="Rectangle">Rectangle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Mounting Type</label>
                  <Select
                    value={formData.mounting_type || ""}
                    onValueChange={(v) => setFormData({ ...formData, mounting_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mounting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Recessed">Recessed</SelectItem>
                      <SelectItem value="Surface">Surface</SelectItem>
                      <SelectItem value="Pendant">Pendant</SelectItem>
                      <SelectItem value="Wall/Ground">Wall/Ground</SelectItem>
                      <SelectItem value="Pole Mount">Pole Mount</SelectItem>
                      <SelectItem value="Adhesive">Adhesive</SelectItem>
                      <SelectItem value="B22/E27">B22/E27</SelectItem>
                      <SelectItem value="Retrofit/Batten">Retrofit/Batten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Price (₹) *</label>
                  <Input
                    type="number"
                    value={formData.price ?? ""}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="299"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">MRP (₹)</label>
                  <Input
                    type="number"
                    value={formData.mrp ?? ""}
                    onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) })}
                    placeholder="450"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">MOQ</label>
                  <Input
                    type="number"
                    value={formData.moq ?? ""}
                    onChange={(e) => setFormData({ ...formData, moq: parseInt(e.target.value) })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Wattage (W)</label>
                  <Input
                    type="number"
                    value={formData.wattage ?? ""}
                    onChange={(e) => setFormData({ ...formData, wattage: parseInt(e.target.value) })}
                    placeholder="6"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Lumens</label>
                  <Input
                    type="number"
                    value={formData.lumens ?? ""}
                    onChange={(e) => setFormData({ ...formData, lumens: parseInt(e.target.value) })}
                    placeholder="600"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Color Temp</label>
                  <Input
                    value={formData.color_temperature || ""}
                    onChange={(e) => setFormData({ ...formData, color_temperature: e.target.value })}
                    placeholder="6500K Cool White"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active ?? true}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured ?? false}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Featured</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}



