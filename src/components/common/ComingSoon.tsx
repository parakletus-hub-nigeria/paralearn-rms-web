"use client";

import { X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface ComingSoonProps {
  featureName: string;
  className?: string;
}

export const ComingSoon = ({ featureName, className }: ComingSoonProps) => {
  const router = useRouter();

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm ${className}`}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center overflow-hidden border-none">
            {/* Close Button */}
            <button 
              onClick={() => router.back()}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center">
              {/* Image Container */}
              <div className="mb-8 relative w-48 h-48 rounded-[2rem] overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 shadow-inner flex items-center justify-center">
                 {/* 
                     Ideally we use the generated asset here. 
                     For now, using a placeholder or the asset path if known.
                     I'll assume the generated image is placed at /assets/coming-soon-tree.png 
                     or similar, but since I can't know the path yet, I'll use a local path 
                     that I will ensure exists.
                 */}
                <Image 
                  src="/PL2 (1).svg" 
                  alt="Feature Taking Root" 
                  width={200} 
                  height={200}
                  className="object-contain w-32 h-32 transform hover:scale-105 transition-transform duration-700 opacity-80"
                />
              </div>

              {/* Text Content */}
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 font-coolvetica tracking-tight leading-tight">
                Exciting things are<br/>taking root!
              </h2>
              
              <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto mb-8">
                The <span className="font-bold text-[#641BC4]">{featureName}</span> module is currently under development. We're building something smarter for your school.
              </p>

              {/* Action Button */}
              <Button
                onClick={() => router.back()}
                className="w-full sm:w-auto min-w-[200px] h-12 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-full font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-95 group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Go Back to Dashboard
              </Button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
