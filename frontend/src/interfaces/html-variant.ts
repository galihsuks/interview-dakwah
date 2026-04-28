export interface HtmlVariantDetail {
  id: number;
  sales_page_id: number;
  label: string;
  plain_html: string;
  created_at: string;
  updated_at: string;
  sales_page: {
    user_id: number;
    product_name: string;
    product_description: string;
    key_features: string[];
    target_audience: string | null;
    price: string | null;
    unique_selling_points: string | null;
    detected_language: string | null;
  };
}
