'use client';

import { Provider } from "react-redux";
import { store } from "@/reduxToolKit/store";

// This just wraps the app in the Redux provider
export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};
