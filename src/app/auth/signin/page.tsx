"use client";
import { UseSelector, useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthHeader from "@/components/auth/authHeader";
import { BiEnvelope } from "react-icons/bi";
import { updateUserData } from "@/reduxToolKit/user/userSlice";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { routespath } from "@/lib/routepath";

const Signin = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const router = useRouter();
  const accessToken = useSelector((state: any) => state.accessToken);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const isValid = () => {
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRe.test(data.email) && data.password.length >= 8;
  };

  const submit = async () => {
    setError(null);
    if (!isValid()) {
      setError("Please enter a valid email and password (min 8 chars)");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/proxy/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to login");
      }
      dispatch(updateUserData(result.data));
      console.log(result.data);
      // login successful
    } catch (e) {
      setError("Network error");
      toast.error("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
      toast.success("Logged in successfully!");
      setTimeout(() => {
        router.push(routespath.DASHBOARD);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center w-[100%] h-[100vh] ">
      <AuthHeader />
      <div className=" border-[1px] border-[#641BC4] rounded-[6px] w-[95%] sm:w-[45%] flex flex-col items-center justify-between py-[40px] h-[445px] bg-[#EDEAFB] mt-[50px]">
        <div className="flex flex-col items-center">
          <p className="text-[20px] font-bold flex flex-row items-center space-x-2">
            {" "}
            <BiEnvelope className="text-[#641BC4]" /> <span>Admin Login</span>
          </p>
          <p>Login to your administrator's account to continue</p>
        </div>

        <div className="w-[90%] space-y-3">
          <div className="flex flex-col w-[100%]">
            <label htmlFor="email">Admin Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={data.email}
              onChange={handleChange}
              className="border-[1px] border-[#641BC4] focus:border-[2px] focus:outline-none h-[45px] w-[100%] p-[13px]"
            />
          </div>

          <div className="flex flex-col w-[100%]">
            <label htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={data.password}
                onChange={handleChange}
                className="border-[1px] border-[#641BC4] focus:border-[2px] focus:outline-none h-[45px] w-[100%] p-[13px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute top-[30%] right-[15px]"
              >
                {!showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}
        </div>

        <div className="w-[100%] flex justify-center">
          <button
            onClick={submit}
            disabled={loading}
            style={
              isValid()
                ? { backgroundColor: "#641BC4" }
                : { backgroundColor: "#a166f0" }
            }
            className="w-[35%] rounded-[12px] font-semibold text-white h-[52px] flex flex-row items-center justify-center"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <div className="w-[90%] text-center mt-4 flex flex-col space-y-2">
          <p>
            <Link
              href="/auth/forgot-password"
              className="text-[#641BC4] font-semibold text-sm"
            >
              Forgot password?
            </Link>
          </p>
          <p>
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-[#641BC4] font-semibold">
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
