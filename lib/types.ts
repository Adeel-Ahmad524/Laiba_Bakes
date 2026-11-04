export type PricingType = "per_pound" | "fixed";

export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type DeliveryType = "delivery" | "pickup";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  pricing_type: PricingType;
  image_url: string | null;
  flavor: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
}

export interface CakeSize {
  id: string;
  label: string;
  pounds: number;
  reference_price: number;
  sort_order: number;
  is_active: boolean;
}

export interface DecorationOption {
  id: string;
  name: string;
  description: string | null;
  charge: number;
  sort_order: number;
  is_active: boolean;
}

export interface Deal {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  code: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  minimum_order: number;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  tagline: string | null;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  delivery_charge: number;
  free_delivery_threshold: number;
  minimum_order: number;
  profit_per_pound: number;
  payment_methods: string[];
  opening_hours: string | null;
  announcement: string | null;
  map_embed_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  updated_at?: string;
}

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  pricingType: PricingType;
  unitPrice: number;
  pounds: number | null;
  quantity: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  pricing_type: PricingType;
  unit_price: number;
  pounds: number | null;
  quantity: number;
  line_total: number;
  options: Record<string, unknown> | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  lookup_token: string;
  customer_id: string;
  order_type: "standard" | "custom";
  status: OrderStatus;
  payment_method: string;
  payment_status: PaymentStatus;
  delivery_type: DeliveryType;
  required_date: string;
  required_time: string;
  subtotal: number;
  decoration_charge: number;
  additional_total: number;
  delivery_charge: number;
  discount: number;
  total: number;
  estimated_profit: number;
  customer_notes: string | null;
  cake_message: string | null;
  cake_colour: string | null;
  decoration_style: string | null;
  design_description: string | null;
  reference_image_path: string | null;
  internal_notes?: string | null;
  whatsapp_opened: boolean;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  order_items?: OrderItem[];
}

export interface Customization {
  id: string;
  order_id: string;
  cake_type: string | null;
  flavour: string | null;
  weight: string | null;
  quantity: number | null;
  decoration: string | null;
  colour: string | null;
  message: string | null;
  special_instructions: string | null;
  design_description: string | null;
  reference_image_path: string | null;
  created_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
}

export interface PublicOrder {
  order_number: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: PaymentStatus;
  delivery_type: DeliveryType;
  required_date: string;
  required_time: string;
  subtotal: number;
  decoration_charge: number;
  additional_total: number;
  delivery_charge: number;
  discount: number;
  total: number;
  cake_message: string | null;
  design_description: string | null;
  created_at: string;
  items: Array<{
    product_name: string;
    pounds: number | null;
    quantity: number;
    line_total: number;
  }>;
  customer_name: string;
}
