'use client';

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { store } from "@/reduxToolKit/store";

// This just wraps the app in the Redux provider
// setupListeners enables refetchOnFocus & refetchOnReconnect for RTK Query
export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const listenersSetup = useRef(false);

  useEffect(() => {
    if (!listenersSetup.current) {
      setupListeners(store.dispatch);
      listenersSetup.current = true;
    }
  }, []);

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};
