"use client";

import { CustomDialog } from "@/components/ui/custom-dialog";

interface ComingSoonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

const ComingSoonModal = ({ open, onOpenChange, title = "Coming Soon" }: ComingSoonModalProps) => (
  <CustomDialog
    open={open}
    onOpenChange={onOpenChange}
    showCloseButton={false}
    className="sm:max-w-md"
    aria-labelledby="coming-soon-title"
    aria-describedby="coming-soon-description"
  >
    <h2
      id="coming-soon-title"
      className="text-2xl md:text-3xl font-black text-center text-slate-900 dark:text-white"
    >
      {title}
    </h2>
    <p
      id="coming-soon-description"
      className="text-center text-base md:text-lg text-slate-600 dark:text-slate-400 pt-2"
    >
      This page is currently under development. We&apos;re working hard to bring you amazing content. Check
      back soon!
    </p>
    <div className="flex justify-center pt-4">
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="px-6 py-3 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-indigo-600 hover:to-primary text-white font-bold rounded-xl shadow-md shadow-primary/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Got it
      </button>
    </div>
  </CustomDialog>
);

export default ComingSoonModal;
