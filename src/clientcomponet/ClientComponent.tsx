'use client';

import { StoreProvider } from "./StoreProvider";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from "sonner";

export default function ClientComponent({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      {/* All our client-side providers and containers go here */}
      {children}
      <Toaster position="top-right" expand={false} richColors />
      <ToastContainer position="top-right" />
    </StoreProvider>
  );
}
