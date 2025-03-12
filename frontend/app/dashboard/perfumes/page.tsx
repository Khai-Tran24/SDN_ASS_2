"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Perfume, PerfumeResponse } from "@/lib/types/perfume";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Form validation schema
const perfumeSchema = z.object({
  perfumeName: z.string().min(1, "Name is required"),
  uri: z.string().min(1, "Image URL is required"),
  price: z.coerce.number().positive("Price must be positive"),
  concentration: z.string().min(1, "Concentration is required"),
  description: z.string().min(1, "Description is required"),
  ingredients: z.string().min(1, "Ingredients are required"),
  volume: z.coerce.number().positive("Volume must be positive"),
  targetAudience: z.string().min(1, "Target audience is required"),
  brand: z.string().min(1, "Brand is required"),
});

type PerfumeFormValues = z.infer<typeof perfumeSchema>;

interface Brand {
  _id: string;
  brandName: string;
  createdAt: string;
  updatedAt: string;
}

export default function PerfumesPage() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPerfume, setCurrentPerfume] = useState<Perfume | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const token = localStorage.getItem("accessToken");

  const form = useForm<PerfumeFormValues>({
    resolver: zodResolver(perfumeSchema),
    defaultValues: {
      perfumeName: "",
      uri: "",
      price: 0,
      concentration: "",
      description: "",
      ingredients: "",
      volume: 0,
      targetAudience: "",
      brand: "",
    },
  });

  // Fetch perfumes and brands on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        router.push("/");
      }
      try {
        const [perfumesResponse, brandsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfumes`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`),
        ]);

        const perfumeData: PerfumeResponse = await perfumesResponse.json();
        const brandsData = await brandsResponse.json();

        if (perfumeData.success) {
          setPerfumes(perfumeData.data);
        }

        if (brandsData.success) {
          setBrands(brandsData.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleAddPerfume = async (data: PerfumeFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/perfumes`,
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
        toast.success("Perfume created successfully");

        // Refresh the perfumes list
        const perfumesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/perfumes`
        );
        const perfumeData = await perfumesResponse.json();

        if (perfumeData.success) {
          setPerfumes(perfumeData.data);
        }

        setIsAddDialogOpen(false);
        form.reset();
      } else {
        toast.error(result.message || "Failed to create perfume");
      }
    } catch (error) {
      console.error("Error creating perfume:", error);
      toast.error("Failed to create perfume. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPerfume = async (data: PerfumeFormValues) => {
    if (!currentPerfume) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/perfumes/${currentPerfume._id}`,
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
        toast.success("Perfume updated successfully");

        // Refresh the perfumes list
        const perfumesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/perfumes`
        );
        const perfumeData = await perfumesResponse.json();

        if (perfumeData.success) {
          setPerfumes(perfumeData.data);
        }

        setIsEditDialogOpen(false);
      } else {
        toast.error(result.message || "Failed to update perfume");
      }
    } catch (error) {
      console.error("Error updating perfume:", error);
      toast.error("Failed to update perfume. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePerfume = async () => {
    if (!currentPerfume) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/perfumes/${currentPerfume._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Perfume deleted successfully");

        // Update the local state by filtering out the deleted perfume
        setPerfumes(perfumes.filter((p) => p._id !== currentPerfume._id));
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(result.message || "Failed to delete perfume");
      }
    } catch (error) {
      console.error("Error deleting perfume:", error);
      toast.error("Failed to delete perfume. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (perfume: Perfume) => {
    setCurrentPerfume(perfume);
    form.reset({
      perfumeName: perfume.perfumeName,
      uri: perfume.uri,
      price: perfume.price,
      concentration: perfume.concentration,
      description: perfume.description,
      ingredients: perfume.ingredients,
      volume: perfume.volume,
      targetAudience: perfume.targetAudience,
      brand: perfume.brand._id,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (perfume: Perfume) => {
    setCurrentPerfume(perfume);
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
        <h1 className="text-2xl font-bold">Perfume Management</h1>
        <Button
          onClick={() => {
            form.reset(); // Reset form when opening add dialog
            setIsAddDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Perfume
        </Button>
      </div>

      {/* Perfumes Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Concentration</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Target</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {perfumes.length > 0 ? (
              perfumes.map((perfume) => (
                <TableRow key={perfume._id}>
                  <TableCell>
                    <div className="w-12 h-12 relative rounded overflow-hidden">
                      <img
                        src={perfume.uri}
                        alt={perfume.perfumeName}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {perfume.perfumeName}
                  </TableCell>
                  <TableCell>{perfume.brand.brandName}</TableCell>
                  <TableCell>${perfume.price.toFixed(2)}</TableCell>
                  <TableCell>{perfume.concentration}</TableCell>
                  <TableCell>{perfume.volume} ml</TableCell>
                  <TableCell>{perfume.targetAudience}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(perfume)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(perfume)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No perfumes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Perfume Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Perfume</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new perfume to the catalog.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddPerfume)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="perfumeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand._id} value={brand._id}>
                              {brand.brandName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (ml)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="concentration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concentration</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select concentration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Eau de Toilette">
                            Eau de Toilette
                          </SelectItem>
                          <SelectItem value="Eau de Parfum">
                            Eau de Parfum
                          </SelectItem>
                          <SelectItem value="Parfum">Parfum</SelectItem>
                          <SelectItem value="Eau de Cologne">
                            Eau de Cologne
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Men">Men</SelectItem>
                          <SelectItem value="Women">Women</SelectItem>
                          <SelectItem value="Unisex">Unisex</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="uri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
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
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Perfume
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Perfume Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Perfume</DialogTitle>
            <DialogDescription>
              Update the details of this perfume.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEditPerfume)}
              className="space-y-4"
            >
              {/* Same form fields as Add Dialog */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="perfumeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand._id} value={brand._id}>
                              {brand.brandName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (ml)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="concentration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concentration</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select concentration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Eau de Toilette">
                            Eau de Toilette
                          </SelectItem>
                          <SelectItem value="Eau de Parfum">
                            Eau de Parfum
                          </SelectItem>
                          <SelectItem value="Parfum">Parfum</SelectItem>
                          <SelectItem value="Eau de Cologne">
                            Eau de Cologne
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Men">Men</SelectItem>
                          <SelectItem value="Women">Women</SelectItem>
                          <SelectItem value="Unisex">Unisex</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="uri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
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
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this perfume? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {currentPerfume && (
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 relative rounded overflow-hidden">
                  <img
                    src={currentPerfume.uri}
                    alt={currentPerfume.perfumeName}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-semibold">{currentPerfume.perfumeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentPerfume.brand.brandName} - $
                    {currentPerfume.price.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeletePerfume}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
