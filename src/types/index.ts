// Standard API envelope — all responses use this shape
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Typed error class for controlled HTTP errors
export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Cart item shape returned from GET /api/cart (joined with product)
export interface CartItemWithProduct {
  id: number;
  sessionId: string;
  quantity: number;
  product: {
    id: number;
    title: string;
    price: string;
    thumbnail: string;
    stock: number;
    discountPercentage: string;
  };
}

// Request body for POST /api/orders
export interface PlaceOrderBody {
  email: string;
  shippingAddress: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentMethod: "cod" | "card" | "upi";
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}
