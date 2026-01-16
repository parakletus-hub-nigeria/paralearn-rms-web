"use client";
import { UseSelector, useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthHeader from "@/components/auth/authHeader";
import { BiEnvelope } from "react-icons/bi";
// import { updateUserData } from "@/reduxToolKit/user/userSlice";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { routespath } from "@/lib/routepath";
import { loginUser } from "@/reduxToolKit/user/userThunks";
import { AppDispatch } from "@/reduxToolKit/store";

const Signin = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { success, error, loading } = useSelector((state: any) => state.user);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const isValid = () => {
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRe.test(data.email) && data.password.length >= 8;
  };

  const submit = async () => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();

      if (result && result.accessToken) {
        toast.success("Logged in successfully!");
        router.push(routespath.DASHBOARD);
      } else {
        toast.error("Login failed. No token received.");
      }
    } catch (e: any) {
      toast.error(
        e || "Login failed. Please check your credentials and try again."
      );
    }
  };

  return (
    <div className="flex flex-col items-center w-[100%] min-h-[100vh] bg-[#F8F7FC]">
      <AuthHeader />
      <div className="border-[1px] border-[#641BC4] rounded-[6px] w-[95%] sm:w-[45%] flex flex-col items-center justify-between py-[40px] bg-[#EDEAFB] mt-[50px]">
        <div className="flex flex-col items-center mb-6">
          <p className="text-[20px] font-bold flex flex-row items-center space-x-2">
            <BiEnvelope className="text-[#641BC4]" /> <span>Admin Login</span>
          </p>
          <p className="text-sm text-gray-700 text-center">
            Login to your administrator's account to continue
          </p>
        </div>
        <div className="w-full space-y-4 px-4">
          <div className="flex flex-col w-full">
            <label htmlFor="email" className="mb-2 text-sm font-medium">
              Admin Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={data.email}
              onChange={handleChange}
              className="border border-[#641BC4] focus:border-2 focus:outline-none h-11 w-full px-3 rounded-md text-base"
              placeholder="Enter your email"
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
              href="/auth/forgot-password"
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
      <ToastContainer position="top-right" />
    </div>
  );
};

export default Signin;
