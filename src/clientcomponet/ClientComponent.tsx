'use client';

import { StoreProvider } from "./StoreProvider";
import { Toaster } from "sonner";

export default function ClientComponent({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      {/* All our client-side providers and containers go here */}
      {children}
      <Toaster 
        position="top-right" 
        expand={true} 
        richColors 
        closeButton
        visibleToasts={5}
        toastOptions={{
          style: {
            zIndex: 999999
          }
        }}
      />
    </StoreProvider>
  );
}
