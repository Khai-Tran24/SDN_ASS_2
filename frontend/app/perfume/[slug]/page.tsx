"use client";

import { useEffect, useState } from "react";
import MyHeader from "@/components/myheader/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Perfume } from "@/lib/types/perfume";
import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function PerfumeDetail({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);

  // Add these new state variables
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0); // 0 means show all

  useEffect(() => {
    const fetchPerfumeDetail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/perfumes/${slug}`
        );
        const data = await response.json();

        if (data.success) {
          setPerfume(data.data);
        } else {
          console.error("Failed to fetch perfume details:", data.message);
        }
      } catch (error) {
        console.error("Error fetching perfume details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfumeDetail();
  }, [slug]);

  // Add this handler function for submitting reviews
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewRating) {
      setSubmitError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/perfumes/${slug}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Assuming you store JWT in localStorage
          },
          body: JSON.stringify({
            content: reviewContent,
            rating: reviewRating,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Reset form
        setReviewContent("");
        setReviewRating(0);

        // Update perfume with new comment
        if (perfume) {
          const updatedPerfume = {
            ...perfume,
            comments: [...perfume.comments, data.data],
          };
          setPerfume(updatedPerfume);
        }
        toast.success("Review submitted successfully");
      } else {
        setSubmitError(data.message || "Failed to submit review");
        toast.error("Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
      setSubmitError("An error occurred while submitting your review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <MyHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!perfume) {
    return (
      <>
        <MyHeader />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Perfume Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The perfume you&#39;re looking for doesn&#39;t exist or has been
            removed.
          </p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center mb-6 hover:text-primary"
        >
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Perfumes
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square relative rounded-lg overflow-hidden border">
            <Image
              src={perfume.uri}
              alt={perfume.perfumeName}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{perfume.perfumeName}</h1>
            <p className="text-lg text-muted-foreground mb-4">
              {perfume.brand.brandName}
            </p>
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-md">
                {perfume.concentration}
              </span>
              <span className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-md">
                {perfume.targetAudience}
              </span>
              <span className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-md">
                {perfume.volume} ml
              </span>
            </div>
            <div className="mb-6">
              <Separator />
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">
                {perfume.description ||
                  "No description available for this perfume."}
              </p>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Ingredients</h2>
              <p className="text-muted-foreground">
                {perfume.ingredients ||
                  "No description available for this perfume."}
              </p>
            </div>

            <span className="text-2xl font-bold">
              ${perfume.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Add Review Form */}
      <div className="mx-16">
        <h2 className="text-2xl font-bold mb-6">Write a Review</h2>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReviewRating(i + 1)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          i < reviewRating
                            ? "fill-primary text-primary"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium mb-1"
                >
                  Your Review
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  placeholder="Share your thoughts about this perfume..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>

              {submitError && (
                <p className="text-sm text-red-500">{submitError}</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Comments Section */}
      <div className="mx-16 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Reviews</h2>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground mr-2">Filter by:</span>
            <Button 
              variant={ratingFilter === 0 ? "default" : "outline"} 
              size="sm"
              onClick={() => setRatingFilter(0)}
            >
              All
            </Button>
            {[...Array(3)].map((_, i) => (
              <Button
                key={i}
                variant={ratingFilter === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setRatingFilter(i + 1)}
                className="flex items-center gap-1"
              >
                {i + 1} <Star className="h-3 w-3 fill-current" />
              </Button>
            ))}
          </div>
        </div>

        {/* Filter the comments based on rating */}
        {perfume.comments
          .filter(comment => ratingFilter === 0 || comment.rating === ratingFilter)
          .map((comment) => (
            <Card key={comment._id} className="mb-4 pt-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{comment.author.name}</p>
                  <div className="flex items-center">
                    {[...Array(3)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < comment.rating
                            ? "fill-primary text-primary"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{comment.content}</p>
              </CardContent>
            </Card>
          ))}
        
        {/* Show message when no reviews match filter */}
        {perfume.comments.filter(comment => ratingFilter === 0 || comment.rating === ratingFilter).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {ratingFilter === 0 
              ? "No reviews yet. Be the first to review this perfume!"
              : `No ${ratingFilter}-star reviews yet.`}
          </div>
        )}
      </div>
    </>
  );
}
