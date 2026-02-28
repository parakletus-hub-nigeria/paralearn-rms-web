"use client";

import { KeyRound, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthHeader from "@/components/auth/authHeader";
import { useResetPasswordMutation } from "@/reduxToolKit/api";
import { toast } from "sonner";

type ResetPasswordPageProps = {
  code: string;
};

export default function ResetPasswordPage({ code }: ResetPasswordPageProps) {
  const [resetPassword, { isLoading: loading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);
  const [data, setData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exp = false;

  const formData = [
    { label: "Password", name: "password", type: "password" },
    { label: "Confirm Password", name: "confirmPassword", type: "password" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prevData) => {
      const next = { ...prevData, [name]: value };
      if (name === "password") {
        setIsPasswordValid(value.length >= 8);
        setIsConfirmPasswordValid(value === next.confirmPassword);
      }
      if (name === "confirmPassword") {
        setIsConfirmPasswordValid(value === next.password);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    setError(null);
    if (!isPasswordValid || !isConfirmPasswordValid) {
      setError("Please ensure both passwords match and are at least 8 characters");
      return;
    }
    
    try {
      await resetPassword({ 
        token: code, 
        newPassword: data.password 
      }).unwrap();
      
      setSubmitted(true);
      toast.success("Password reset successfully");
    } catch (e: any) {
      const errorMsg = e?.message || e?.data?.message || "An error occurred";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="flex flex-col items-center w-[100%] min-h-[100vh]">
      <AuthHeader />
      <div className="w-[95%] md:w-[70%] lg:w-[45%] flex flex-col items-center justify-between py-[40px] min-h-[445px] h-auto mt-[30px] mb-[30px]">
        {exp ? (
          <div className="w-[90%] space-y-5 flex flex-col items-center">
            <p className="text-[20px] font-bold text-red-500">Link Expired</p>
            <p className="text-center text-sm">
              This reset link has already expired. Please request a new one.
            </p>
            <Link
              href="/auth/forgot-password"
              className="w-[100%] rounded-[12px] font-semibold text-white h-[52px] flex flex-row items-center justify-center"
              style={{ backgroundColor: "#641BC4" }}
            >
              Request New Link
            </Link>
          </div>
        ) : !submitted ? (
          <>
            <div className="w-[90%] space-y-5">
              <div className="flex flex-col items-center">
                <KeyRound className="size-[90px] rounded-[50%] p-[20px] bg-gray-300 my-2" />
                <p className="text-[20px] font-bold">
                  <span>Set New Password</span>
                </p>
                <p className="text-center text-sm">
                  Your new password must be different from previously used password
                </p>
              </div>

              {formData.map((form) => (
                <div key={form.name} className="flex flex-col w-[100%]">
                  <label htmlFor={form.name}>{form.label}</label>
                  <div className="relative">
                    <input
                      id={form.name}
                      name={form.name}
                      type={showPassword ? "text" : form.type}
                      value={data[form.name as keyof typeof data]}
                      onChange={handleChange}
                      placeholder={`Enter your ${form.label.toLowerCase()}`}
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
                  {form.name === "password" && !isPasswordValid && data.password && (
                    <p className="text-red-500 text-sm">
                      Password must be at least 8 characters
                    </p>
                  )}
                  {form.name === "confirmPassword" &&
                    data.confirmPassword &&
                    !isConfirmPasswordValid && (
                      <p className="text-red-500 text-sm">Passwords do not match</p>
                    )}
                </div>
              ))}

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="w-[100%] flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={loading || !isPasswordValid || !isConfirmPasswordValid}
                style={
                  loading || !isPasswordValid || !isConfirmPasswordValid
                    ? { backgroundColor: "#a166f0" }
                    : { backgroundColor: "#641BC4" }
                }
                className="w-[90%] rounded-[12px] font-semibold text-white h-[52px] flex flex-row items-center justify-center mt-[20px]"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </>
        ) : (
          <div className="w-[90%] space-y-5 flex flex-col items-center">
            <KeyRound className="size-[70px] rounded-[50%] p-[10px] bg-gray-300" />
            <div className="text-center">
              <p className="text-[20px] font-bold mb-2">Password Reset</p>
              <p className="text-sm text-gray-600">
                Your password has been successfully reset. Click below to log in.
              </p>
            </div>

            <button
              onClick={() => (window.location.href = "/auth/signin")}
              className="w-[100%] rounded-[12px] font-semibold text-white h-[52px] flex flex-row items-center justify-center"
              style={{ backgroundColor: "#641BC4" }}
            >
              Back to Login
            </button>
          </div>
        )}

        <div className="w-[90%] text-center mt-4 flex flex-col space-y-2">
          <p>
            <Link
              href="/auth/signin"
              className="font-semibold flex flex-row items-center justify-center text-[#641BC4] hover:underline"
            >
              <ArrowLeft className="mr-2" size={18} /> Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
