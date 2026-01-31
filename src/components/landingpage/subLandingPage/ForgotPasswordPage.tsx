"use client";

import { useState } from "react";
import Link from "next/link";
import AuthHeader from "@/components/auth/authHeader";
import { BiEnvelope } from "react-icons/bi";
import { ArrowLeft, KeyRound } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = () => {
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRe.test(email);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!isValidEmail()) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/proxy/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setEmail("");
      } else {
        throw new Error(json.message || "An error occurred. Please try again.");
      }
    } catch (e) {
      toast.error("Failed to send reset link. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-[100%] min-h-[100vh]">
      <ToastContainer />
      <AuthHeader />
      <div className="w-[95%] md:w-[70%] lg:w-[45%] flex flex-col items-center justify-between py-[40px] min-h-[445px] h-auto mt-[30px] mb-[30px]">
        {!submitted ? (
          <>
            <div className="w-[90%] space-y-5">
              <div className="flex flex-col items-center">
                <KeyRound className="size-[90px] rounded-[50%] p-[20px] bg-gray-300 my-2" />
                <p className="text-[20px] font-bold">
                  <span>Forgot Password</span>
                </p>
                <p className="text-center text-sm">
                  Please enter your email to receive your reset instructions
                </p>
              </div>

              <div className="flex flex-col w-[100%]">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your admin email"
                  className="border-[1px] border-[#641BC4] focus:border-[2px] focus:outline-none h-[45px] w-[100%] p-[13px]"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="w-[100%] flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={
                  isValidEmail()
                    ? { backgroundColor: "#641BC4" }
                    : { backgroundColor: "#a166f0" }
                }
                className="w-[90%] rounded-[12px] font-semibold text-white h-[52px] flex flex-row items-center justify-center mt-[20px]"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </>
        ) : (
          <div className="w-[90%] space-y-5 flex flex-col items-center">
            <BiEnvelope className="size-[70px] rounded-[50%] p-[10px] bg-gray-300" />
            <div className="text-center">
              <p className="text-[20px] font-bold mb-2">Check your mail</p>
              <p className="text-sm text-gray-600">
                We have sent a password reset link to{" "}
                <span className="font-semibold">{email}</span>
              </p>
            </div>

            <button
              onClick={() => {
                window.location.href = "mailto:";
              }}
              className="w-[100%] rounded-[12px] font-semibold text-white h-[52px] flex flex-row items-center justify-center"
              style={{ backgroundColor: "#641BC4" }}
            >
              Open Email App
            </button>

            <p className="text-sm">
              Did not receive an email?{" "}
              <button
                onClick={handleSubmit}
                className="text-[#641BC4] font-semibold hover:underline"
              >
                Click to resend
              </button>
            </p>
          </div>
        )}

        <div className="w-[90%] text-center mt-4 flex flex-col space-y-2">
          <p>
            <Link
              href="/auth/signin"
              className="font-semibold flex flex-row items-center justify-center"
            >
              <ArrowLeft /> Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
