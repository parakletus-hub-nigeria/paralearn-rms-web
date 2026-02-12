"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  getCurrentUserProfile,
  updateUserProfile,
  changePassword,
  getTenantInfo,
} from "@/reduxToolKit/user/userThunks";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { User, Lock, Save, Calendar, Phone, MapPin, Mail } from "lucide-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../../public/mainLogo.svg";

export const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUserProfile, loading, error, success, tenantInfo } = useSelector(
    (state: RootState) => state.user
  );

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    dispatch(getCurrentUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (currentUserProfile) {
      setProfileData({
        firstName: currentUserProfile.firstName || "",
        lastName: currentUserProfile.lastName || "",
        email: currentUserProfile.email || "",
        phoneNumber: currentUserProfile.phoneNumber || "",
        address: currentUserProfile.address || "",
        dateOfBirth: currentUserProfile.dateOfBirth
          ? new Date(currentUserProfile.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: currentUserProfile.gender || "",
      });
    }
  }, [currentUserProfile]);

  useEffect(() => {
    if (success) {
      toast.success("Profile updated successfully!");
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserProfile?.id) {
      toast.error("User ID not found");
      return;
    }

    try {
      await dispatch(
        updateUserProfile({
          userId: currentUserProfile.id,
          ...profileData,
        })
      ).unwrap();
      
      // Refresh profile data
      dispatch(getCurrentUserProfile());
    } catch (error: any) {
      toast.error(error || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await dispatch(
        changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      ).unwrap();

      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error || "Failed to change password");
    }
  };

  return (
    <div className="w-full min-h-screen pb-8">
      <Header 
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />
      
      <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Manage your personal information and account security
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-slate-100 rounded-lg">
            <TabsTrigger 
              value="profile" 
              className="flex items-center justify-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base font-medium">Profile Information</span>
            </TabsTrigger>
            <TabsTrigger 
              value="password" 
              className="flex items-center justify-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base font-medium">Change Password</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card className="border border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                  Personal Information
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-slate-600 mt-1">
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                {loading && !currentUserProfile ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <Image
                        src={logo}
                        alt="Loading"
                        width={80}
                        height={80}
                        className="animate-pulse drop-shadow-lg"
                        priority
                      />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, firstName: e.target.value })
                          }
                          required
                          className="h-11 bg-slate-50/50 focus:bg-white border-slate-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, lastName: e.target.value })
                          }
                          required
                          className="h-11 bg-slate-50/50 focus:bg-white border-slate-300"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="h-11 bg-slate-100 border-slate-300 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Email cannot be changed
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={profileData.phoneNumber}
                          onChange={(e) =>
                            setProfileData({ ...profileData, phoneNumber: e.target.value })
                          }
                          placeholder="+234 123 456 7890"
                          className="h-11 bg-slate-50/50 focus:bg-white border-slate-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date of Birth
                        </Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) =>
                            setProfileData({ ...profileData, dateOfBirth: e.target.value })
                          }
                          className="h-11 bg-slate-50/50 focus:bg-white border-slate-300"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="gender" className="text-sm font-semibold text-slate-700">
                          Gender
                        </Label>
                        <select
                          id="gender"
                          value={profileData.gender}
                          onChange={(e) =>
                            setProfileData({ ...profileData, gender: e.target.value })
                          }
                          className="flex h-11 w-full rounded-md border border-slate-300 bg-slate-50/50 focus:bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#641BC4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Address
                      </Label>
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) =>
                          setProfileData({ ...profileData, address: e.target.value })
                        }
                        placeholder="Enter your full address"
                        className="h-11 bg-slate-50/50 focus:bg-white border-slate-300"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto bg-gradient-to-r from-[#641BC4] to-[#8538E0] hover:from-[#5a2ba8] hover:to-[#7530c7] text-white shadow-md hover:shadow-lg transition-all"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <Card className="border border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                  Change Password
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-slate-600 mt-1">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-semibold text-slate-700">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                        placeholder="Enter your current password"
                        className="h-11 bg-slate-50/50 focus:bg-white border-slate-300 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showPasswords.current ? "Hide password" : "Show password"}
                      >
                        {showPasswords.current ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                        placeholder="Enter new password (min. 6 characters)"
                        className="h-11 bg-slate-50/50 focus:bg-white border-slate-300 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showPasswords.new ? "Hide password" : "Show password"}
                      >
                        {showPasswords.new ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">Password must be at least 6 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                        placeholder="Confirm your new password"
                        className="h-11 bg-slate-50/50 focus:bg-white border-slate-300 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
                      >
                        {showPasswords.confirm ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {passwordData.newPassword &&
                      passwordData.confirmPassword &&
                      passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-xs text-red-600">Passwords do not match</p>
                      )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
                    <Button
                      type="submit"
                      disabled={loading || passwordData.newPassword !== passwordData.confirmPassword}
                      className="w-full sm:w-auto bg-gradient-to-r from-[#641BC4] to-[#8538E0] hover:from-[#5a2ba8] hover:to-[#7530c7] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {loading ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
