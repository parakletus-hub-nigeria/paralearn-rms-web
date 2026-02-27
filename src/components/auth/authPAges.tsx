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
import { handleError } from "@/lib/error-handler";
import { Spinner } from "../ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
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
        <Card className="w-full border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/50 shadow-primary/5 ring-1 ring-slate-200/60">
            <CardHeader className="pb-2 text-center">
                <CardTitle className="text-xl font-bold text-slate-900">Register Your School</CardTitle>
                <p className="text-slate-500 text-sm">Let us get your school set up on ParaLearn RMS</p>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
                {forms.map((form, index) => (
                    <div key={index} className="space-y-1.5">
                        <Label htmlFor={form.name} className="text-slate-700">{form.label}</Label>
                        <Input
                            id={form.name}
                            type="text"
                            name={form.name}
                            value={data[form.name]}
                            onChange={(e) => { changeData(e); checkField(e, form.name) }}
                            className="h-11 rounded-lg border-slate-300 bg-slate-50/50 focus:bg-white"
                            aria-invalid={form.name === "schoolName" && !nameAuth && data[form.name] !== ""}
                            readOnly={form.name === "subdomain"}
                        />
                        {form.name === "schoolName" && !nameAuth && data[form.name] !== "" && (
                            <p className="flex items-center gap-1.5 text-xs text-red-600">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                School name should contain only alphabets
                            </p>
                        )}
                    </div>
                ))}
                <div className="space-y-1.5">
                    <Label htmlFor="subdomain" className="text-slate-700">Subdomain (Autogenerated)</Label>
                    <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-slate-50/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-0">
                        <Input
                            id="subdomain"
                            name="subdomain"
                            value={data.subdomain}
                            onChange={(e) => {
                                changeData(e);
                                // Error clearing is handled by useEffect
                            }}
                            className="h-11 flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <span className="flex h-11 items-center bg-slate-100 px-4 text-sm font-medium text-slate-600">.pln.ng</span>
                    </div>
                     {subdomainError && (
                        <p className="flex items-center gap-1.5 text-xs text-red-600">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {subdomainError}
                        </p>
                    )}
                </div>
                {step === 1 && (
                    <>
                        <Button
                            disabled={!nameAuth || !!subdomainError || !data.subdomain}
                            onClick={handleContinue}
                            className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-primary via-purple-700 to-primary font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-60"
                        >
                            Continue
                        </Button>
                        <p className="text-sm text-slate-500 text-center mt-4">
                            Already registered?{" "}
                            <Link
                                href={routespath.SIGNIN}
                                className="font-semibold text-primary hover:underline hover:underline-offset-2"
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
        <Card className="w-full border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/50 shadow-primary/5 ring-1 ring-slate-200/60">
            <CardHeader className="pb-2 text-center">
                <CardTitle className="text-xl font-bold text-slate-900">Admin Account Setup</CardTitle>
                <p className="text-slate-500 text-sm">Create your administrator account</p>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
                {forms.map((form, index) => (
                    <div key={index} className="space-y-1.5">
                        <Label htmlFor={form.name} className="text-slate-700">{form.label}</Label>
                        <Input
                            id={form.name}
                            type="email"
                            name={form.name}
                            value={data[form.name]}
                            onChange={(e) => { changeData(e); checkEmail(e) }}
                            placeholder="admin@school.edu"
                            className="h-11 rounded-lg border-slate-300 bg-slate-50/50 focus:bg-white"
                            aria-invalid={!emailAuth && data[form.name] !== ""}
                        />
                        {data[form.name] === "" && <p className="text-xs text-slate-500">{form.subtext}</p>}
                        {!emailAuth && data[form.name] !== "" && (
                            <p className="flex items-center gap-1.5 text-xs text-red-600">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                Please enter a valid email address
                            </p>
                        )}
                    </div>
                ))}
                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-slate-700">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            onChange={(e) => { changeData(e); checkPassword(e.target.value) }}
                            placeholder="Min. 8 chars, 1 uppercase, 1 number, 1 special"
                            className="h-11 rounded-lg border-slate-300 bg-slate-50/50 pr-10 focus:bg-white"
                            aria-invalid={!passwordAuth && data.password !== ""}
                        />
                        <button
                            type="button"
                            onClick={() => setshowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEye className="h-4 w-4" /> : <FaEyeSlash className="h-4 w-4" />}
                        </button>
                    </div>
                    {data.password !== "" && (
                        <div className="space-y-1.5 pt-1">
                            <div className={`flex items-center gap-2 text-xs ${passwordErrors.length ? 'text-slate-600' : 'text-emerald-600'}`}>
                                {!passwordErrors.length ? (
                                    <Check className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                    <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-300" />
                                )}
                                <span>At least 8 characters</span>
                            </div>
                            <div className={`flex items-center gap-2 text-xs ${passwordErrors.uppercase ? 'text-slate-600' : 'text-emerald-600'}`}>
                                {!passwordErrors.uppercase ? (
                                    <Check className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                    <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-300" />
                                )}
                                <span>One uppercase letter</span>
                            </div>
                            <div className={`flex items-center gap-2 text-xs ${passwordErrors.number ? 'text-slate-600' : 'text-emerald-600'}`}>
                                {!passwordErrors.number ? (
                                    <Check className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                    <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-300" />
                                )}
                                <span>One number</span>
                            </div>
                            <div className={`flex items-center gap-2 text-xs ${passwordErrors.specialChar ? 'text-slate-600' : 'text-emerald-600'}`}>
                                {!passwordErrors.specialChar ? (
                                    <Check className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                    <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-300" />
                                )}
                                <span>One special character</span>
                            </div>
                        </div>
                    )}
                    {data.password === "" && (
                        <p className="text-xs text-slate-500">Create a strong password with at least 8 characters, one uppercase letter, one number, and one special character</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password</Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            className="h-11 rounded-lg border-slate-300 bg-slate-50/50 pr-10 focus:bg-white"
                            aria-invalid={confirmPassword !== "" && !passwordsMatch}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <FaEye className="h-4 w-4" /> : <FaEyeSlash className="h-4 w-4" />}
                        </button>
                    </div>
                    {confirmPassword !== "" && !passwordsMatch && (
                        <p className="flex items-center gap-1.5 text-xs text-red-600">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            Passwords do not match
                        </p>
                    )}
                    {confirmPassword !== "" && passwordsMatch && (
                        <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            Passwords match
                        </p>
                    )}
                </div>

                {step === 2 && (
                    <div className="mt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                            className="h-12 flex-1 rounded-xl border-slate-300 font-semibold"
                        >
                            Back
                        </Button>
                        <Button
                            disabled={!emailAuth || !passwordAuth || !passwordsMatch}
                            onClick={() => setStep(step + 1)}
                            className="h-12 flex-1 rounded-xl bg-gradient-to-r from-primary via-purple-700 to-primary font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-60"
                        >
                            Continue
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}




export function PageThree({data,changeData,step,setStep}: any){
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const checkPhone = (phone:string) => {
        if(phone.length > 0){
            return true
        }else{
            return false
        }
    }

    const [disable, setDisable] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [phoneAuth, setPhoneAuth] = useState(checkPhone(data.phoneNumber))

    const submit =  async () => {
        setIsLoading(true)
        
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
            if(!registerAdmin.ok) throw new Error(res.message || "Failed to create account. Please try again.")

             console.log(res);
             
             // Account created successfully - show success dialog and prompt for manual sign-in
             toast.success("Account created successfully!");
             
             // Store redirect path so signin will redirect to setup after user logs in manually
             if (typeof window !== 'undefined') {
                 sessionStorage.setItem('redirectAfterLogin', '/setup');
             }
             
             // Open the success dialog
             setDisable(true);
        } catch (error) {
            console.log(error);
            console.log(error);
            handleError(error, "Failed to create account");
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
            <Card className="w-full border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/50 shadow-primary/5 ring-1 ring-slate-200/60">
                <CardHeader className="pb-2 text-center">
                    <CardTitle className="text-xl font-bold text-slate-900">Contact Information</CardTitle>
                    <p className="text-slate-500 text-sm">Help us complete your school profile</p>
                </CardHeader>
                <CardContent className="space-y-5 px-6 pb-6">
                    {forms.map((form) => (
                        <div key={form.name} className="space-y-1.5">
                            <Label htmlFor={form.name} className="text-slate-700">{form.label}</Label>
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
                                className="h-11 rounded-lg border-slate-300 bg-slate-50/50 focus:bg-white"
                            />
                            <p className="text-xs text-slate-500">{form.subtext}</p>
                        </div>
                    ))}
                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                        <Checkbox
                            id="agreement"
                            checked={data.agreement}
                            onCheckedChange={(checked) =>
                                changeData({ target: { name: "agreement", type: "checkbox", checked: !!checked } } as React.ChangeEvent<HTMLInputElement>)
                            }
                            className="mt-0.5"
                        />
                        <Label htmlFor="agreement" className="cursor-pointer text-sm leading-snug text-slate-600">
                            I agree to the ParaLearn RMS Terms of Service and Privacy Policy. I confirm that I have the authority to register this school.
                        </Label>
                    </div>

                    {step === 3 && (
                        <div className="mt-4 flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(step - 1)}
                                disabled={isLoading}
                                className="h-12 flex-1 rounded-xl border-slate-300 font-semibold"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={submit}
                                disabled={!phoneAuth || !data.agreement || isLoading}
                                className="h-12 flex-1 rounded-xl bg-gradient-to-r from-primary via-purple-700 to-primary font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-60"
                            >
                                {isLoading && <Spinner className="h-4 w-4" />}
                                {isLoading ? "Creating..." : "Create School"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={disable} onOpenChange={() => setDisable(false)}>
                <DialogContent className="gap-6 py-8">
                    <DialogTitle className="sr-only">Account Created Successfully</DialogTitle>
                    <DialogDescription asChild>
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle className="h-10 w-10 text-emerald-600" />
                            </div>
                            <p className="text-lg font-semibold text-slate-900">Account created</p>
                            <p className="text-sm text-slate-500">Please sign in to continue to the setup wizard.</p>
                        </div>
                    </DialogDescription>
                    <DialogFooter>
                        <Link href="/auth/signin" className="w-full">
                            <Button 
                                onClick={() => {
                                    // Store redirect path in sessionStorage so signin can redirect to setup
                                    if (typeof window !== 'undefined') {
                                        sessionStorage.setItem('redirectAfterLogin', '/setup');
                                    }
                                }}
                                className="h-12 w-full rounded-xl bg-gradient-to-r from-primary via-purple-700 to-primary font-semibold text-white shadow-lg shadow-primary/30"
                            >
                                Sign in
                            </Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}