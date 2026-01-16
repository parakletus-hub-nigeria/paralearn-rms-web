"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import { apiFetch } from "@/lib/interceptor";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";

const UserDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await apiFetch(`/api/proxy/users/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const result = await response.json();
        setUser(result.data || result);
      } catch (error: any) {
        toast.error(error?.message || "Failed to fetch user details");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen">
        <p className="text-gray-600">User not found</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">User Details</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-lg text-gray-900">
              {user.firstName} {user.lastName}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-lg text-gray-900">{user.email || "N/A"}</p>
          </div>

          {user.dateOfBirth && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Date of Birth
              </label>
              <p className="text-lg text-gray-900">
                {new Date(user.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          )}

          {user.gender && (
            <div>
              <label className="text-sm font-medium text-gray-500">Gender</label>
              <p className="text-lg text-gray-900 capitalize">{user.gender}</p>
            </div>
          )}

          {user.phoneNumber && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Phone Number
              </label>
              <p className="text-lg text-gray-900">{user.phoneNumber}</p>
            </div>
          )}

          {user.address && (
            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-lg text-gray-900">{user.address}</p>
            </div>
          )}

          {user.roles && user.roles.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="text-lg text-gray-900 capitalize">
                {user.roles[0]?.role?.name || user.roles[0] || "N/A"}
              </p>
            </div>
          )}

          {(user.studentId || user.teacherId) && (
            <div>
              <label className="text-sm font-medium text-gray-500">ID</label>
              <p className="text-lg text-gray-900">
                {user.studentId || user.teacherId}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function UserDetail() {
  return (
    <ProtectedRoute>
      <SideBar>
        <UserDetailPage />
      </SideBar>
    </ProtectedRoute>
  );
}
