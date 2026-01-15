// import { store } from "@/state/store";
// import { store } from @st
// import { store } from "@/reduxToolKit/store";
import { logout } from "@/state/user/userSlice";
import { store } from "@/reduxToolKit/store";
import tokenManager from "./tokenManager";

export const apiFetch = async (
  urlPath: string,
  options?: RequestInit
): Promise<Response> => {
  const state = store.getState();
  const accessToken = tokenManager.getToken() || state.user.accessToken;

  const headers: any = {
    ...options?.headers,
  };

  if (accessToken) {
    headers["authorization"] = `Bearer ${accessToken}`;
    headers["X-Tenant-Subdomain"] = "greenwood-heritage-college";
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(urlPath, config);
    if (response.status == 401) {
      console.log(response);
      console.error("Session expired. Please log in again.");
      store.dispatch(logout());
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "API request failed");
    }
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
