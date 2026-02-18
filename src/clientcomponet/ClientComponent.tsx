'use client';

import { StoreProvider } from "./StoreProvider";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from "sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";

export default function ClientComponent({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      {/* All our client-side providers and containers go here */}
      {children}
      <Toaster position="top-right" expand={false} richColors />
      <ShadcnToaster />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 99999 }}
      />
    </StoreProvider>
  );
}
