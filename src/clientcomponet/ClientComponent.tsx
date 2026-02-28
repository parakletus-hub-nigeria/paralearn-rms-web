'use client';

import { StoreProvider } from "./StoreProvider";

export default function ClientComponent({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      {/* All our client-side providers and containers go here */}
      {children}
    </StoreProvider>
  );
}
