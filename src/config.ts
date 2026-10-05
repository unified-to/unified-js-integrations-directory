// Mirrors `defaultUrls` in unified-api's src/config_dc.ts
export const DATA_CENTERS = ['us', 'eu', 'au', 'dev'] as const;
export type TDataCenter = (typeof DATA_CENTERS)[number];

export const API_URLS: { [dc in TDataCenter]: string } = {
    us: 'https://api.unified.to',
    eu: 'https://api-eu.unified.to',
    au: 'https://api-au.unified.to',
    dev: 'https://api-dev.unified.to',
};
