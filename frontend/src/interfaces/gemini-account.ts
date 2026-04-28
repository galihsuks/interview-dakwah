export interface GeminiAccountSettings {
  model: string;
  has_api_key: boolean;
  api_key_masked: string | null;
  rpm: number;
  rpd: number;
  tpm: number | null;
  last_quota_synced_at: string | null;
  updated_at: string | null;
}

export interface UpdateGeminiAccountPayload {
  api_key?: string;
  clear_api_key?: boolean;
  model?: string;
  tpm?: number | null;
}
