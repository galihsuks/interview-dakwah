export interface SalesPage {
  id: number;
  user_id: number;
  product_name: string;
  product_description: string;
  key_features: string[];
  target_audience: string | null;
  price: string | null;
  unique_selling_points: string | null;
  html_variants: SalesPageVariant[];
  detected_language: 'id' | 'en' | string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesPageVariant {
  label: string;
  plain_html: string;
}

export interface SalesPagePayload {
  product_name: string;
  product_description: string;
  key_features: string[];
  target_audience?: string;
  price?: string;
  unique_selling_points?: string;
}

export interface SalesFormState {
  product_name: string;
  product_description: string;
  key_features: string[];
  target_audience: string;
  price: string;
  unique_selling_points: string;
}
