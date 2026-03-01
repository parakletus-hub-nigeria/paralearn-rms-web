"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const LoginModal = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleOpenModal = (event: Event) => {
      setOpen(true);
    };

    window.addEventListener("openLoginModal" as any, handleOpenModal);
    return () => {
      window.removeEventListener("openLoginModal" as any, handleOpenModal);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900">
            Welcome back to ParaLearn.
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            How do you use the platform?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Option A: School Administrator */}
          <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-indigo-500/10 rounded-xl p-6 border border-primary/20">
            <h3 className="font-black text-lg text-slate-900 mb-2">
              Option A: I am a School Administrator
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Access the Master Dashboard to manage users, approve results, and configure settings.
            </p>
            <Button
              className="w-full bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:via-purple-500/90 hover:to-indigo-500/90"
              onClick={() => {
                setOpen(false);
                router.push("/auth/signin");
              }}
            >
              Go to Admin Web Portal
            </Button>
          </div>

          {/* Option B: Teacher or Student */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="font-black text-lg text-slate-900 mb-2">
              Option B: I am a Teacher or Student
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              ParaLearn for the classroom lives on your device. Access your CBT exams, grade books, and report cards via the mobile app.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 border-2 hover:bg-primary hover:text-white hover:border-primary"
                onClick={() => {
                  // Replace with actual App Store link
                  window.open("https://apps.apple.com", "_blank");
                }}
              >
                Download on App Store
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-2 hover:bg-primary hover:text-white hover:border-primary"
                onClick={() => {
                  // Replace with actual Google Play link
                  window.open("https://play.google.com", "_blank");
                }}
              >
                Get it on Google Play
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
