// Single source of truth for authorized token spenders
export const SPENDER_CONFIG = {
  bsc: import.meta.env.VITE_BSC_SPENDER_ADDRESS || "",
  tron: import.meta.env.VITE_TRON_SPENDER_ADDRESS || "",
};
