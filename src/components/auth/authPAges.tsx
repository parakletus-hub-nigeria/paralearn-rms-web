import { useState, useEffect } from "react"
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/reduxToolKit/store";
import { loginUser } from "@/reduxToolKit/user/userThunks";
import { AlertCircle, CheckCircle, Check } from "lucide-react";
import { routespath } from "@/lib/routepath";
import { toast } from "sonner";

import { Spinner } from "../ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
interface formData {
    schoolName: string
    subdomain: string
    adminEmail: string
    password: string
    phoneNumber: string
    schoolAddress: string
    agreement: boolean
}
import apiClient from "@/lib/api";


export function PageOne({data,changeData,step,setStep}: any){
    const checkName = (email:string) => {
        const regex = /^[a-zA-Z ]+$/
        if(regex.test(email)){
            return true
        }else{
            return false
        }
    }
    const [nameAuth,setNameAuth] = useState(() => checkName(data["schoolName"]))
    const [subdomainError, setSubdomainError] = useState<string | null>(null);
    const [existingSubdomains, setExistingSubdomains] = useState<string[]>([]);
    const [isLoadingSubdomains, setIsLoadingSubdomains] = useState(true);

    useEffect(() => {
        const fetchSubdomains = async () => {
             try {
                // Use the public endpoint to get all subdomains
                const response = await apiClient.get(`/api/proxy${routespath.API_GET_SUBDOMAINS}`);
                if (response.data && response.data.success && Array.isArray(response.data.data)) {
                    setExistingSubdomains(response.data.data);
                }
             } catch (error) {
                console.error("Failed to fetch subdomains:", error);
                // Fail silently or allow user to proceed if check fails? 
                // User requirement implies strict check, but if fetch fails we can't check.
                // For now, valid list remains empty so no blocks, which is safe fallback.
             } finally {
                setIsLoadingSubdomains(false);
             }
        }
        fetchSubdomains();
    }, []);

    // Check subdomain availability whenever data.subdomain changes
    useEffect(() => {
        if (!data.subdomain) {
            setSubdomainError(null);
            return;
        }

        const isTaken = existingSubdomains.includes(data.subdomain.toLowerCase());
        if (isTaken) {
            setSubdomainError(`Subdomain '${data.subdomain}' is already taken.`);
        } else {
            setSubdomainError(null);
        }
    }, [data.subdomain, existingSubdomains]);

    const handleContinue = () => {
        if (!subdomainError) {
            setStep(step + 1);
        }
    };

    const checkField = (e : React.ChangeEvent<HTMLInputElement>,name:string) => {
            const regex = /^[a-zA-Z ]+$/;
            regex.test(e.target.value) ? setNameAuth(true) : setNameAuth(false)
            
            // Clear subdomain error when user changes school name (which might change subdomain)
            if (name === "schoolName") {
                // Logic handled by useEffect on subdomain change
            }
    }

    const forms = [
        {
            label:"School Name",
            name:"schoolName",
            type:"text",
            subtext:"Enter your school name "
        }
    ]

    return (
        <Card className="w-full" style={{ border: "1px solid var(--border-fine)", background: "white", boxShadow: "var(--shadow-card)" }}>
            <CardHeader className="pb-2 text-center">
                <CardTitle className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Register Your School</CardTitle>
                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>Let us get your school set up on ParaLearn RMS</p>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
                {forms.map((form, index) => (
                    <div key={index} className="space-y-1.5">
                        <Label htmlFor={form.name} style={{ color: "var(--foreground)" }}>{form.label}</Label>
                        <Input
                            id={form.name}
                            type="text"
                            name={form.name}
                            value={data[form.name]}
                            onChange={(e) => { changeData(e); checkField(e, form.name) }}
                            className="h-11"
                            style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-medium)", background: "var(--surface-muted)" }}
                            aria-invalid={form.name === "schoolName" && !nameAuth && data[form.name] !== ""}
                            readOnly={form.name === "subdomain"}
                        />
                        {form.name === "schoolName" && !nameAuth && data[form.name] !== "" && (
                            <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--crimson-signal)" }}>
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                School name should contain only alphabets
                            </p>
                        )}
                    </div>
                ))}
                <div className="space-y-1.5">
                    <Label htmlFor="subdomain" style={{ color: "var(--foreground)" }}>Subdomain (Autogenerated)</Label>
                    <div className="flex overflow-hidden" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-medium)", background: "var(--surface-muted)" }}>
                        <Input
                            id="subdomain"
                            name="subdomain"
                            value={data.subdomain}
                            onChange={(e) => {
                                changeData(e);
                            }}
                            className="h-11 flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <span className="flex h-11 items-center px-4 text-sm font-medium" style={{ background: "var(--border-fine)", color: "var(--foreground-muted)" }}>.pln.ng</span>
                    </div>
                     {subdomainError && (
                        <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--crimson-signal)" }}>
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {subdomainError}
                        </p>
                    )}
                </div>
                {step === 1 && (
                    <>
                        <button
                            disabled={!nameAuth || !!subdomainError || !data.subdomain}
                            onClick={handleContinue}
                            className="mt-2 h-12 w-full font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                            style={{ borderRadius: "var(--radius-lg)", background: "var(--violet-ink)", border: "none", boxShadow: "var(--shadow-card)" }}
                        >
                            Continue
                        </button>
                        <p className="text-sm text-center mt-4" style={{ color: "var(--foreground-muted)" }}>
                            Already registered?{" "}
                            <Link
                                href={routespath.SIGNIN}
                                className="font-semibold hover:underline hover:underline-offset-2"
                            style={{ color: "var(--violet-ink)" }}
                            >
                                Sign in
                            </Link>
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export function PageTwo({data,changeData,step,setStep}: any){
    const emailCheck = () => {
         // Stricter TLD check (2-6 chars) to catch typos like .comwasw
         const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if(data["adminEmail"].length > 0 && emailRegex.test(data["adminEmail"])){
            return true
        }else{return false}
    }
    const passwordCheck = () => {
        const password = data["password"];
        if (!password || password.length < 8) return false;
        
        // Check for uppercase letter
        const hasUpperCase = /[A-Z]/.test(password);
        // Check for special character
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        // Check for number
        const hasNumber = /[0-9]/.test(password);
        
        return hasUpperCase && hasSpecialChar && hasNumber;
    }
    const [emailAuth, setemailAuth] = useState(emailCheck())
    const [showPassword, setshowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordAuth, setPasswordAuth] = useState(passwordCheck())
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordErrors, setPasswordErrors] = useState({
        length: false,
        uppercase: false,
        specialChar: false,
        number: false
    })
    const passwordsMatch = confirmPassword === data.password && confirmPassword !== ""
    const forms = [
        {
            label:"Admin Email",
            name:"adminEmail",
            type:"text",
            subtext:"This will be your login email and school contact"
        }
    ]

   const checkEmail = (e : React.ChangeEvent<HTMLInputElement>) => {
  // Stricter TLD check (2-6 chars) to catch typos like .comwasw
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if(emailRegex.test(e.target.value)){
    setemailAuth(true)
  }else{setemailAuth(false)}
}

    const checkPassword = (password : string) => {
        const errors = {
            length: password.length < 8,
            uppercase: !/[A-Z]/.test(password),
            specialChar: !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            number: !/[0-9]/.test(password)
        };
        
        setPasswordErrors(errors);
        
        // Password is valid if all requirements are met
        const isValid = password.length >= 8 && !errors.uppercase && !errors.specialChar && !errors.number;
        setPasswordAuth(isValid);
    }


    return (
        <Card className="w-full" style={{ border: "1px solid var(--border-fine)", background: "white", boxShadow: "var(--shadow-card)" }}>
            <CardHeader className="pb-2 text-center">
                <CardTitle className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Admin Account Setup</CardTitle>
                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>Create your administrator account</p>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
                {forms.map((form, index) => (
                    <div key={index} className="space-y-1.5">
                        <Label htmlFor={form.name} style={{ color: "var(--foreground)" }}>{form.label}</Label>
                        <Input
                            id={form.name}
                            type="email"
                            name={form.name}
                            value={data[form.name]}
                            onChange={(e) => { changeData(e); checkEmail(e) }}
                            placeholder="admin@school.edu"
                            className="h-11"
                            style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-medium)", background: "var(--surface-muted)" }}
                            aria-invalid={!emailAuth && data[form.name] !== ""}
                        />
                        {data[form.name] === "" && <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>{form.subtext}</p>}
                        {!emailAuth && data[form.name] !== "" && (
                            <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--crimson-signal)" }}>
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                Please enter a valid email address
                            </p>
                        )}
                    </div>
                ))}
                <div className="space-y-1.5">
                    <Label htmlFor="password" style={{ color: "var(--foreground)" }}>Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            onChange={(e) => { changeData(e); checkPassword(e.target.value) }}
                            placeholder="Min. 8 chars, 1 uppercase, 1 number, 1 special"
                            className="h-11 pr-10"
                            style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-medium)", background: "var(--surface-muted)" }}
                            aria-invalid={!passwordAuth && data.password !== ""}
                        />
                        <button
                            type="button"
                            onClick={() => setshowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: "var(--foreground-muted)" }}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEye className="h-4 w-4" /> : <FaEyeSlash className="h-4 w-4" />}
                        </button>
                    </div>
                    {data.password !== "" && (
                        <div className="space-y-1.5 pt-1">
                            <div className="flex items-center gap-2 text-xs" style={{ color: passwordErrors.length ? "var(--foreground-muted)" : "var(--emerald-signal)" }}>
                                {!passwordErrors.length ? (
                                    <Check className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                    <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2" style={{ borderColor: "var(--border-medium)" }} />
                                )}
                                <span>At least 8 characters</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs" style={{ color: passwordErrors.uppercase ? "var(--foreground-muted)" : "var(--emerald-signal)" }}>
                                {!passwordErrors.uppercase ? (
                                    <Check className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                    <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2" style={{ borderColor: "var(--border-medium)" }} />
                                )}
                                <span>One uppercase letter</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs" style={{ color: passwordErrors.number ? "var(--foreground-muted)" : "var(--emerald-signal)" }}>
                                {!passwordErrors.number ? (
                                    <Check className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                    <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2" style={{ borderColor: "var(--border-medium)" }} />
                                )}
                                <span>One number</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs" style={{ color: passwordErrors.specialChar ? "var(--foreground-muted)" : "var(--emerald-signal)" }}>
                                {!passwordErrors.specialChar ? (
                                    <Check className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                    <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2" style={{ borderColor: "var(--border-medium)" }} />
                                )}
                                <span>One special character</span>
                            </div>
                        </div>
                    )}
                    {data.password === "" && (
                        <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Create a strong password with at least 8 characters, one uppercase letter, one number, and one special character</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" style={{ color: "var(--foreground)" }}>Confirm Password</Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            className="h-11 pr-10"
                            style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-medium)", background: "var(--surface-muted)" }}
                            aria-invalid={confirmPassword !== "" && !passwordsMatch}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: "var(--foreground-muted)" }}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <FaEye className="h-4 w-4" /> : <FaEyeSlash className="h-4 w-4" />}
                        </button>
                    </div>
                    {confirmPassword !== "" && !passwordsMatch && (
                        <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--crimson-signal)" }}>
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            Passwords do not match
                        </p>
                    )}
                    {confirmPassword !== "" && passwordsMatch && (
                        <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--emerald-signal)" }}>
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            Passwords match
                        </p>
                    )}
                </div>

                {step === 2 && (
                    <div className="mt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setStep(step - 1)}
                            className="h-12 flex-1 font-semibold"
                            style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-medium)", background: "white", color: "var(--foreground)" }}
                        >
                            Back
                        </button>
                        <button
                            disabled={!emailAuth || !passwordAuth || !passwordsMatch}
                            onClick={() => setStep(step + 1)}
                            className="h-12 flex-1 font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                            style={{ borderRadius: "var(--radius-lg)", background: "var(--violet-ink)", border: "none", boxShadow: "var(--shadow-card)" }}
                        >
                            Continue
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}




export function PageThree({data,changeData,step,setStep}: any){
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const checkPhone = (phone: string) => {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        return phoneRegex.test(phone);
    }

    const [disable, setDisable] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [phoneAuth, setPhoneAuth] = useState(checkPhone(data.phoneNumber))
    const [submitError, setSubmitError] = useState<string | null>(null)

    const submit =  async () => {
        setIsLoading(true)
        setSubmitError(null)
        
        const backendData = {
            schoolName: data.schoolName,
            domain: data.subdomain,
            adminEmail: data.adminEmail,
            adminPassword: data.password,
            adminFirstName: "",
            adminLastName:"",
            phoneNumber: data.phoneNumber,
            schoolAddress: data.schoolAddress,
            motto: null,
            website: null,
        }

        try {
             const registerAdmin = await fetch('/api/proxy/auth/register-school',{
                headers:{
                    'Content-Type':'application/json'
                },
                method:'POST',
                body: JSON.stringify(backendData),
            })

            const res = await registerAdmin.json()
            if(!registerAdmin.ok) {
                // Robustly extract error message from all possible backend response shapes
                const errorMessage =
                    res?.message ||
                    res?.error ||
                    res?.data?.message ||
                    res?.data?.error ||
                    `Request failed with status ${registerAdmin.status}`;
                throw new Error(errorMessage);
            }

             // Account created successfully - show success dialog and prompt for manual sign-in
             toast.success("Account created successfully!");
             
             // Store redirect path so signin will redirect to setup after user logs in manually
             if (typeof window !== 'undefined') {
                 sessionStorage.setItem('redirectAfterLogin', '/setup');
             }
             
             // Open the success dialog
             setDisable(true);
        } catch (error: any) {
            console.error(error);
            const message = error?.message || "Failed to create account. Please try again.";
            setSubmitError(message);
            toast.error(message, { position: "top-right", duration: Infinity });
        } finally {
            setIsLoading(false)
        }
    }

    const forms = [
   {
            label:"Phone Number",
            name:"phoneNumber",
            type:"tel",
            subtext:"Enter your phone number"
        },
        {
            label:"School Address",
            name:"schoolAddress",
            type:"text",
            subtext:"Enter your school Address"
        }
    ]

    return (
        <>
            <Card className="w-full" style={{ border: "1px solid var(--border-fine)", background: "white", boxShadow: "var(--shadow-card)" }}>
                <CardHeader className="pb-2 text-center">
                    <CardTitle className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Contact Information</CardTitle>
                    <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>Help us complete your school profile</p>
                </CardHeader>
                <CardContent className="space-y-5 px-6 pb-6">
                    {forms.map((form) => (
                        <div key={form.name} className="space-y-1.5">
                            <Label htmlFor={form.name} style={{ color: "var(--foreground)" }}>{form.label}</Label>
                            <Input
                                id={form.name}
                                type={form.type as "text" | "number" | "tel"}
                                name={form.name}
                                value={data[form.name]}
                                onChange={(e) => {
                                    changeData(e);
                                    if (form.name === "phoneNumber") setPhoneAuth(checkPhone(e.target.value));
                                }}
                                placeholder={form.subtext}
                                className="h-11"
                                style={{ borderRadius: "var(--radius-lg)", border: form.name === "phoneNumber" && !phoneAuth && data.phoneNumber !== "" ? "1px solid var(--crimson-signal)" : "1px solid var(--border-medium)", background: "var(--surface-muted)" }}
                            />
                            {form.name === "phoneNumber" && !phoneAuth && data.phoneNumber !== "" && (
                                <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--crimson-signal)" }}>
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    Please enter a valid phone number (at least 10 digits)
                                </p>
                            )}
                            {!(form.name === "phoneNumber" && !phoneAuth && data.phoneNumber !== "") && (
                                <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>{form.subtext}</p>
                            )}
                        </div>
                    ))}
                    <div className="flex items-start gap-3 p-4" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-fine)", background: "var(--surface-muted)" }}>
                        <Checkbox
                            id="agreement"
                            checked={data.agreement}
                            onCheckedChange={(checked) =>
                                changeData({ target: { name: "agreement", type: "checkbox", checked: !!checked } } as React.ChangeEvent<HTMLInputElement>)
                            }
                            className="mt-0.5"
                        />
                        <Label htmlFor="agreement" className="cursor-pointer text-sm leading-snug" style={{ color: "var(--foreground-muted)" }}>
                            I agree to the ParaLearn RMS Terms of Service and Privacy Policy. I confirm that I have the authority to register this school.
                        </Label>
                    </div>


                    {step === 3 && (
                        <div className="mt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                disabled={isLoading}
                                className="h-12 flex-1 font-semibold disabled:opacity-50"
                                style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-medium)", background: "white", color: "var(--foreground)" }}
                            >
                                Back
                            </button>
                            <button
                                onClick={submit}
                                disabled={!phoneAuth || !data.agreement || isLoading}
                                className="h-12 flex-1 font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                                style={{ borderRadius: "var(--radius-lg)", background: "var(--violet-ink)", border: "none", boxShadow: "var(--shadow-card)" }}
                            >
                                {isLoading && <Spinner className="h-4 w-4" />}
                                {isLoading ? "Creating..." : "Create School"}
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={disable} onOpenChange={() => setDisable(false)}>
                <DialogContent className="gap-6 py-8">
                    <DialogTitle className="sr-only">Account Created Successfully</DialogTitle>
                    <DialogDescription asChild>
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "var(--emerald-tint)" }}>
                                <CheckCircle className="h-10 w-10" style={{ color: "var(--emerald-signal)" }} />
                            </div>
                            <p className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Account created</p>
                            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>Please sign in to continue to the setup wizard.</p>
                        </div>
                    </DialogDescription>
                    <DialogFooter>
                        <Link href="/auth/signin" className="w-full">
                            <button
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        sessionStorage.setItem('redirectAfterLogin', '/setup');
                                    }
                                }}
                                className="h-12 w-full font-semibold text-white"
                                style={{ borderRadius: "var(--radius-lg)", background: "var(--violet-ink)", border: "none", boxShadow: "var(--shadow-card)" }}
                            >
                                Sign in
                            </button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}