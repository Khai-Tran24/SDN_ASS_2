"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Plus, Trash, Loader2 } from "lucide-react";
import { toast } from "sonner";

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define interfaces
interface Brand {
  _id: string;
  brandName: string;
  createdAt: string;
  updatedAt: string;
}

interface BrandResponse {
  success: boolean;
  count: number;
  data: Brand[];
}

// Form validation schema
const brandSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
});

type BrandFormValues = z.infer<typeof brandSchema>;

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      brandName: "",
    },
  });

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/brands`
        );
        const data: BrandResponse = await response.json();

        if (data.success) {
          setBrands(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch brands:", error);
        toast.error("Failed to fetch brands. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Handle adding a new brand
  const handleAddBrand = async (data: BrandFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brands`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Brand created successfully");

        // Refresh the brands list
        const brandsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/brands`
        );
        const brandData = await brandsResponse.json();

        if (brandData.success) {
          setBrands(brandData.data);
        }

        setIsAddDialogOpen(false);
        form.reset();
      } else {
        toast.error(result.message || "Failed to create brand");
      }
    } catch (error) {
      console.error("Error creating brand:", error);
      toast.error("Failed to create brand. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle editing a brand
  const handleEditBrand = async (data: BrandFormValues) => {
    if (!currentBrand) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${currentBrand._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Brand updated successfully");

        // Refresh the brands list
        const brandsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/brands`
        );
        const brandData = await brandsResponse.json();

        if (brandData.success) {
          setBrands(brandData.data);
        }

        setIsEditDialogOpen(false);
      } else {
        toast.error(result.message || "Failed to update brand");
      }
    } catch (error) {
      console.error("Error updating brand:", error);
      toast.error("Failed to update brand. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a brand
  const handleDeleteBrand = async () => {
    if (!currentBrand) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${currentBrand._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Brand deleted successfully");
        setBrands(brands.filter((b) => b._id !== currentBrand._id));
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(result.message || "Failed to delete brand");
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error("Failed to delete brand. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (brand: Brand) => {
    setCurrentBrand(brand);
    form.reset({ brandName: brand.brandName });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (brand: Brand) => {
    setCurrentBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brand Management</h1>
        <Button
          onClick={() => {
            form.reset(); // Reset form when opening add dialog
            setIsAddDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length > 0 ? (
              brands.map((brand) => (
                <TableRow key={brand._id}>
                  <TableCell className="font-medium">
                    {brand.brandName}
                  </TableCell>
                  <TableCell>
                    {new Date(brand.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(brand.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(brand)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(brand)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No brands found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Brand Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
            <DialogDescription>
              Enter the details for the new brand.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddBrand)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="brandName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Brand"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Brand Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>Update the brand details.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEditBrand)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="brandName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Brand"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Brand Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this brand? This action cannot be
              undone.
              {/* Note: Brands with associated perfumes cannot be deleted. */}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteBrand}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Brand"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
