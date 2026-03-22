"use client";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthHeader from "@/components/auth/authHeader";
import { BiEnvelope } from "react-icons/bi";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import { useRouter } from "next/navigation";
import { loginUser } from "@/reduxToolKit/user/userThunks";
import { AppDispatch } from "@/reduxToolKit/store";
import { pickRedirectPath } from "@/reduxToolKit/user/userUtils";

const Signin = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<"admin" | "teacher" | "student">(
    "admin",
  );
  const [institutionType, setInstitutionType] = useState<"k12" | "university">(
    "k12",
  );

  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: any) => state.user);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const isValid = () => {
    if (loginMode === "admin") {
      const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRe.test(data.email) && data.password.length >= 8;
    }
    // Teacher / Student: username (subdomain) + user code
    return data.email.trim().length >= 2 && data.password.trim().length >= 3;
  };

  const submit = async () => {
    try {
      const result = await dispatch(
        loginUser({ ...data, institutionType }),
      ).unwrap();

      if (result && result.accessToken) {
        // Subdomain redirect happens inside the thunk — just show toast
        if (result.redirecting) {
          toast.success("Logged in successfully! Redirecting...");
          return;
        }

        toast.success("Logged in successfully!");
        const roles = result.user?.roles || [];
        router.push(pickRedirectPath(roles, institutionType));
      } else {
        toast.error("Login failed. No token received.");
      }
    } catch (e: any) {
      handleError(
        e,
        "Login failed. Please check your credentials and try again.",
      );
    }
  };

  return (
    <div className="flex flex-col items-center w-[100%] min-h-[100vh] bg-[#F8F7FC]">
      <AuthHeader />
      <div className="border-[1px] border-[#641BC4] rounded-[6px] w-[95%] sm:w-[45%] flex flex-col items-center justify-between py-[40px] bg-[#EDEAFB] mt-[50px]">
        <div className="flex flex-col items-center mb-6">
          <p className="text-[20px] font-bold flex flex-row items-center space-x-2">
            <BiEnvelope className="text-[#641BC4]" />{" "}
            <span>
              {loginMode === "admin"
                ? "Admin Login"
                : loginMode === "teacher"
                  ? "Teacher Login"
                  : "Student Login"}
            </span>
          </p>
          <p className="text-sm text-gray-700 text-center px-4">
            {loginMode === "admin"
              ? "Login to your administrator's account to continue"
              : "Login with your username and password"}
          </p>
        </div>

        {/* Role tabs */}
        <div className="w-full px-4 mb-6">
          <div className="grid grid-cols-3 gap-2 bg-white/60 p-1 rounded-xl border border-[#641BC4]/30">
            {(["admin", "teacher", "student"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setLoginMode(mode)}
                className={`h-11 rounded-lg font-semibold text-xs sm:text-sm transition-all capitalize ${
                  loginMode === mode
                    ? "bg-[#641BC4] text-white shadow-sm"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Institution type */}
        <div className="w-full px-4 mb-4">
          <div className="flex gap-4 p-1 pb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="institutionType"
                value="k12"
                checked={institutionType === "k12"}
                onChange={() => setInstitutionType("k12")}
                className="w-4 h-4 text-[#641BC4]"
              />
              <span className="text-sm font-medium text-slate-700">
                K-12 School
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="institutionType"
                value="university"
                checked={institutionType === "university"}
                onChange={() => setInstitutionType("university")}
                className="w-4 h-4 text-[#641BC4]"
              />
              <span className="text-sm font-medium text-slate-700">
                University / College
              </span>
            </label>
          </div>
        </div>

        {/* Credentials */}
        <div className="w-full space-y-4 px-4">
          <div className="flex flex-col w-full">
            <label htmlFor="email" className="mb-2 text-sm font-medium">
              {loginMode === "admin" ? "Admin Email" : "Username"}
            </label>
            <input
              id="email"
              name="email"
              type={loginMode === "admin" ? "email" : "text"}
              value={data.email}
              onChange={handleChange}
              className="border border-[#641BC4] focus:border-2 focus:outline-none h-11 w-full px-3 rounded-md text-base"
              placeholder={
                loginMode === "admin"
                  ? "Enter your email"
                  : "Enter your username"
              }
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="password" className="mb-2 text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={data.password}
                onChange={handleChange}
                className="border border-[#641BC4] focus:border-2 focus:outline-none h-11 w-full px-3 rounded-md text-base pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-lg text-gray-600"
              >
                {!showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <button
          onClick={submit}
          disabled={loading}
          style={
            isValid()
              ? { backgroundColor: "#641BC4" }
              : { backgroundColor: "#a166f0" }
          }
          className="w-full sm:w-3/4 rounded-xl font-semibold text-white h-12 flex flex-row items-center justify-center transition-colors duration-200 disabled:opacity-70 mt-6"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="w-full text-center mt-4 flex flex-col space-y-2 px-4">
          <p>
            <Link
              href={
                institutionType === "university"
                  ? "/auth/uni-forgot-password"
                  : "/auth/forgot-password"
              }
              className="text-[#641BC4] font-semibold text-sm hover:underline"
            >
              Forgot password?
            </Link>
          </p>
          <p className="text-sm">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-[#641BC4] font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;
