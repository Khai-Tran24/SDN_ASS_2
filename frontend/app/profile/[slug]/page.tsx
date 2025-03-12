"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/context/authContext";

// Form validation schema for profile editing
const profileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    YOB: z.coerce
      .number()
      .min(1900, "Year must be after 1900")
      .max(new Date().getFullYear(), "Year cannot be in the future"),
    gender: z.boolean(),
    // Optional password fields - will only be validated if currentPassword is provided
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Only validate password fields if user is trying to change password
      if (data.currentPassword) {
        if (!data.newPassword) return false;
        if (!data.confirmPassword) return false;
        if (data.newPassword !== data.confirmPassword) return false;
      }
      return true;
    },
    {
      message: "New passwords don't match or are missing",
      path: ["confirmPassword"],
    }
  );

// Remove the separate passwordSchema since we've integrated it

// Update the interface to include optional password fields
interface ProfileData {
  name: string;
  email: string;
  YOB: number;
  gender: boolean;
  createdAt?: string;
  _id?: string;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const accessToken = localStorage.getItem("accessToken");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      YOB: new Date().getFullYear() - 30,
      gender: false,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!params.slug) return;

      try {
        setIsLoading(true);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/member/${params.slug}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        setProfileData(data.data);

        // Update form values with fetched data
        form.reset({
          name: data.data.name,
          email: data.data.email,
          YOB: data.data.YOB,
          gender: data.data.gender,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [params.slug, accessToken, form]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!profileData || !params.slug) return;

    setIsLoading(true);
    setError("");

    // Create the payload - only include password fields if currentPassword is provided
    const payload = {
      name: values.name,
      email: values.email,
      YOB: values.YOB,
      gender: values.gender,
    };

    // Add password fields to payload if user is changing password
    if (values.currentPassword && values.newPassword) {
      Object.assign(payload, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/member/${params.slug}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedData = await response.json();
      setProfileData(updatedData.data);
      setIsEditing(false);

      // Clear password fields
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmPassword", "");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to update profile");
      } else {
        setError("Failed to update profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change

  // Check if this profile belongs to logged-in user
  const isOwnProfile = user && profileData && user._id === profileData._id;

  if (isLoading && !profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl space-y-6">
      {/* Profile Information Card */}
      <Card className="w-full pt-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {isEditing ? "Edit Profile" : "Profile Information"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update your personal information"
              : "View your personal information"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-lg font-medium">{profileData?.name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-lg">{profileData?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Year of Birth
                  </p>
                  <p className="text-lg">{profileData?.YOB}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Gender
                  </p>
                  <p className="text-lg">
                    {profileData?.gender ? "Male" : "Female"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Account Created
                </p>
                <p className="text-lg">
                  {profileData?.createdAt &&
                    new Date(profileData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="YOB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year of Birth</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Year of birth"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value, 10))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          defaultValue={field.value ? "true" : "false"}
                          onValueChange={(value) =>
                            field.onChange(value === "true")
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="false">Female</SelectItem>
                            <SelectItem value="true">Male</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Add divider and password section when editing */}
                {isEditing && (
                  <>
                    <hr className="my-6" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Change Password</h3>
                      <p className="text-sm text-muted-foreground">
                        Leave blank if you don't want to change your password
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </form>
            </Form>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
              {isOwnProfile && (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
