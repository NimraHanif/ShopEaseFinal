export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  active: boolean;
  photoUrl?: string | null;
  category: Category;
};

export type Address = {
  id: string;
  label: string;
  recipientName: string;
  phoneNumber: string;
  /** GraphQL field name returned by the API */
  address: string;
  city: string;
  postalCode: string;
  country: string;
  default: boolean;
  // Optional fields not returned by current API but kept for compatibility
  addressLine1?: string | null;
  addressLine2?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean | null;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  photoUrl?: string | null;
  quantity: number;
  stock: number;
};

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type OrderItem = {
  id: string;
  price: number;
  quantity: number;
  product?: {
    id: string;
    name: string;
    photoUrl?: string | null;
  } | null;
  productId?: string;
  productNameAtPurchase?: string;
  priceAtPurchase?: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  totalPrice: number;
  createdAt: string;
  address?: Address | null;
  orderItems?: OrderItem[];
  items?: OrderItem[];
  deliveryAddressSnapshot?: string | Address | null;
};

export type MutationError = {
  field?: string;
  message: string;
  code: string;
};

export type MutationResponse<T> = {
  success: boolean;
  message?: string;
  errors?: MutationError[];
  result?: T;
};

export type SupportArticle = {
  id: string;
  title: string;
  content: string;
  position?: number;
};