"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";

// Removed unused DecodedToken interface

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = localStorage.getItem("accessToken");
  const decodedToken = token
    ? (jwtDecode(token) as JwtPayload & { isAdmin?: boolean })
    : null;
  console.log(decodedToken);

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (decodedToken && decodedToken.isAdmin) {
      setIsAuthenticated(true);
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [decodedToken, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Once loaded, if authenticated, show the children components
  return isAuthenticated ? <>{children}</> : null;
}
