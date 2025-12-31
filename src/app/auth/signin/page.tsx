"use client"

import { useState } from "react"
import Link from "next/link"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import AuthHeader from "@/components/auth/authHeader"
import { BiEnvelope } from "react-icons/bi"

const Signin = () => {
    const [data, setData] = useState({ adminEmail: "", password: "" })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    const isValid = () => {
        const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return emailRe.test(data.adminEmail) && data.password.length >= 8
    }

    const submit = async () => {
        setError(null)
        if (!isValid()) {
            setError("Please enter a valid email and password (min 8 chars)")
            return
        }
        setLoading(true)
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            const json = await res.json()
            if (res.ok) {
                localStorage.setItem("token", json.token)
                // redirect to dashboard or home
                window.location.href = "/dashboard"
            } else {
                setError(json.message || "Login failed")
            }
        } catch (e) {
            setError("Network error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center w-[100%] h-[100vh] ">
            <AuthHeader/>
            <div className=" border-[1px] border-[#641BC4] rounded-[6px] w-[95%] sm:w-[45%] flex flex-col items-center justify-between py-[40px] h-[445px] bg-[#EDEAFB] mt-[50px]">
            <div className="flex flex-col items-center">
                <p className="text-[20px] font-bold flex flex-row items-center space-x-2"> <BiEnvelope className="text-[#641BC4]"/> <span>Admin Login</span></p>
                <p>Login to your administrator's account to continue</p>
            </div>

            <div className="w-[90%] space-y-3">
                <div className="flex flex-col w-[100%]">
                    <label htmlFor="adminEmail">Admin Email</label>
                    <input
                        id="adminEmail"
                        name="adminEmail"
                        type="email"
                        value={data.adminEmail}
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
                    style={isValid() ? { backgroundColor: "#641BC4" } : { backgroundColor: "#a166f0" }}
                    className="w-[35%] rounded-[12px] font-semibold text-white h-[52px] flex flex-row items-center justify-center"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </div>

            <div className="w-[90%] text-center mt-4 flex flex-col space-y-2">
                <p>
                    <Link href="/auth/forgot-password" className="text-[#641BC4] font-semibold text-sm">Forgot password?</Link>
                </p>
                <p>
                    Don't have an account? <Link href="/auth/signup" className="text-[#641BC4] font-semibold">Sign up</Link>
                </p>
            </div>
        </div>
        </div>
    )
}

export default Signin