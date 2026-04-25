import type { WebsiteConfigApiEndpoint } from "~~/shared/website/website-config.keys";
import { WEBSITE_CONFIG_API_ENDPOINTS } from "~~/shared/website/website-config.keys";

export const useWebsiteConfig = () => {
  const saveConfig = async (
    apiEndpoint: WebsiteConfigApiEndpoint,
    data: unknown,
  ) => {
    const response = await $fetch(WEBSITE_CONFIG_API_ENDPOINTS[apiEndpoint], {
      method: "PATCH",
      credentials: "include",
      body: {
        settings: {
          data,
        },
      },
    });
    return response.website_config;
  };

  return {
    saveConfig,
  };
};
