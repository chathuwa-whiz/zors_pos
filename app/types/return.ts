export interface ProductReturn {
  _id?: string;
  productId: string;
  product: {
    _id: string;
    name: string;
    sellingPrice: number;
  };
  returnType: 'customer' | 'supplier';
  quantity: number;
  reason: string;
  cashier: {
    _id: string;
    username: string;
  };
  createdAt: Date;
  notes?: string;
}

export interface ProductReturnRequest {
  productId: string;
  returnType: 'customer' | 'supplier';
  quantity: number;
  reason: string;
  notes?: string;
}