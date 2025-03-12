"use client";

import { useEffect, useState } from "react";
import MyHeader from "@/components/myheader/header";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Add this import
import Image from "next/image";
import { PerfumeResponse, Perfume } from "@/lib/types/perfume";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Add this interface for brands
interface Brand {
  _id: string;
  brandName: string;
}

export default function Home() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredPerfumes, setFilteredPerfumes] = useState<Perfume[]>([]);

  // Add states for brands and search
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch perfumes and brands
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch perfumes
        const perfumeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/perfumes`
        );
        const perfumeData: PerfumeResponse = await perfumeResponse.json();

        // Fetch brands
        const brandsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/brands`
        );
        const brandsData = await brandsResponse.json();

        if (perfumeData.success) {
          setPerfumes(perfumeData.data);
          setFilteredPerfumes(perfumeData.data);
        }

        if (brandsData.success) {
          setBrands(brandsData.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle brand filter change
  const handleBrandFilter = async (value: string) => {
    setSelectedBrand(value);
    setSearchQuery(""); // Reset search when changing brand filter

    try {
      setLoading(true);

      // If "all" is selected, fetch all perfumes
      if (value === "all") {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/perfumes`
        );
        const data: PerfumeResponse = await response.json();

        if (data.success) {
          setFilteredPerfumes(data.data);
        }
      } else {
        // Otherwise, fetch perfumes filtered by brand
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/perfumes/filter?selectedBrand=${value}`
        );
        const data: PerfumeResponse = await response.json();

        if (data.success) {
          setFilteredPerfumes(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to filter perfumes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search by name
  const handleSearch = async (value: string) => {
    setSearchQuery(value);

    try {
      setLoading(true);

      if (value.trim() === "") {
        // If search is empty, reset to current brand filter or show all
        if (selectedBrand && selectedBrand !== "all") {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/perfumes/filter?selectedBrand=${selectedBrand}`
          );
          const data: PerfumeResponse = await response.json();
          if (data.success) {
            setFilteredPerfumes(data.data);
          }
        } else {
          // No brand filter, show all perfumes
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/perfumes`
          );
          const data: PerfumeResponse = await response.json();
          if (data.success) {
            setFilteredPerfumes(data.data);
          }
        }
      } else {
        // Search by name
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/perfumes/search?query=${value}`
        );
        const data: PerfumeResponse = await response.json();
        if (data.success) {
          setFilteredPerfumes(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to search perfumes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MyHeader />

      {/* Content Section */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-6">Perfumes</h2>

        {/* Filters - Brand Select and Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="flex-1">
            <Select value={selectedBrand} onValueChange={handleBrandFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand._id} value={brand._id}>
                    {brand.brandName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardHeader>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredPerfumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPerfumes.map((perfume) => (
              <Card
                key={perfume._id}
                className="flex flex-col overflow-hidden transition-all hover:shadow-lg"
              >
                <div className="aspect-square relative">
                  <Image
                    src={perfume.uri}
                    alt={perfume.perfumeName}
                    fill
                    className="object-cover h-96"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                <CardHeader className="pb-2">
                  <h3 className="font-semibold text-lg truncate">
                    {perfume.perfumeName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {perfume.brand.brandName}
                  </p>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-lg">
                      ${perfume.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-md mb-1">
                        {perfume.concentration}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link href={`/perfume/${perfume._id}`} className="w-full">
                    <Button variant="default" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-lg">No perfumes found</p>
          </div>
        )}
      </section>
    </>
  );
}
