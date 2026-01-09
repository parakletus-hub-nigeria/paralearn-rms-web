"use client"
import { UseSelector, useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import Link from "next/link"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import AuthHeader from "@/components/auth/authHeader"
import { BiEnvelope } from "react-icons/bi"
import { updateUserData } from "@/state/user/userSlice"
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from "next/navigation"
import { routespath } from "@/lib/routepath"


const Signin = () => {
    const [data, setData] = useState({ email: "", password: "" })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const dispatch = useDispatch()

    const router = useRouter();
    const accessToken = useSelector((state: any) => state.accessToken);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    const isValid = () => {
        const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return emailRe.test(data.email) && data.password.length >= 8
    }

    const submit = async () => {
        setError(null)
        if (!isValid()) {
            setError("Please enter a valid email and password (min 8 chars)")
            return
        }
        setLoading(true)
        try {
            const response = await fetch("/api/proxy/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)       
        })
        const result = await response.json();
        if(!response.ok){
            throw new Error(result.message || "Failed to login");
        }
        dispatch(updateUserData(result.data)) 
        // login successful
        } catch (e) {
            setError("Network error")
            toast.error("Login failed. Please check your credentials and try again.")
        } finally {
            setLoading(false)
            toast.success("Logged in successfully!")
            setTimeout(() => {
            router.push(routespath.DASHBOARD)
            }, 500);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7FC] px-2">
            <AuthHeader/>
            <div className="border border-[#641BC4] rounded-lg w-full max-w-md md:max-w-lg lg:max-w-xl flex flex-col items-center justify-between py-8 px-4 sm:px-8 bg-[#EDEAFB] mt-8 shadow-md">
                <div className="flex flex-col items-center mb-6">
                    <p className="text-xl md:text-2xl font-bold flex flex-row items-center space-x-2"> <BiEnvelope className="text-[#641BC4]"/> <span>Admin Login</span></p>
                    <p className="text-sm md:text-base text-gray-700 text-center">Login to your administrator's account to continue</p>
                </div>

                <div className="w-full space-y-4">
                    <div className="flex flex-col w-full">
                        <label htmlFor="email" className="mb-1 text-sm font-medium">Admin Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={handleChange}
                            className="border border-[#641BC4] focus:border-2 focus:outline-none h-11 w-full px-3 rounded-md text-base"
                        />
                    </div>

                    <div className="flex flex-col w-full">
                        <label htmlFor="password" className="mb-1 text-sm font-medium">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={data.password}
                                onChange={handleChange}
                                className="border border-[#641BC4] focus:border-2 focus:outline-none h-11 w-full px-3 rounded-md text-base pr-10"
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

                <div className="w-full flex justify-center mt-6">
                    <button
                        onClick={submit}
                        disabled={loading}
                        style={isValid() ? { backgroundColor: "#641BC4" } : { backgroundColor: "#a166f0" }}
                        className="w-full sm:w-1/2 rounded-xl font-semibold text-white h-12 flex flex-row items-center justify-center transition-colors duration-200 disabled:opacity-70"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </div>

                <div className="w-full text-center mt-4 flex flex-col space-y-2">
                    <p>
                        <Link href="/auth/forgot-password" className="text-[#641BC4] font-semibold text-sm">Forgot password?</Link>
                    </p>
                    <p className="text-sm">
                        Don't have an account? <Link href="/auth/signup" className="text-[#641BC4] font-semibold">Sign up</Link>
                    </p>
                </div>
            </div>
            <ToastContainer position="top-right" />
        </div>
    )
}

export default Signin