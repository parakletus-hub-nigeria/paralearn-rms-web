import { createApiClient } from "./apiFactory";

// Our global axios instance for all University API calls, utilizing the custom uni-proxy
const uniApiClient = createApiClient("/api/uni-proxy");

export default uniApiClient;
