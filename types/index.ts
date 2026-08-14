export type Role = "OWNER" | "WORKER" | "ADMIN";
export type Gender = "MALE" | "FEMALE";
export type WorkerStatus = "ACTIVE" | "INACTIVE" | "FIRED";

export interface WorkerResponse {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  address: string;
  gender: Gender;
  status: WorkerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateWorkerRequest {
  fullname?: string;
  email?: string;
  phone?: string;
  address?: string;
  gender?: Gender;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: Role;
}

export interface UserResponse {
  id: number;
  email: string;
  role: Role;
}

export interface BusinessRequest {
  shopName: string;
  location: string;
  phone: string;
  email: string;
  password: string;
  fullname: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface CategoryRequest {
  name: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  quantity: number;
}

export interface UpdateProductRequest {
  sellingPrice?: number;
  categoryName?: string;
}

export interface ProductResponse {
  id: number;
  productId: string;
  name: string;
  category: string | null;
  costPrice: number | null;
  sellingPrice: number | null;
  addedByName: string;
  updatedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequest {
  productName: string;
  categoryName: string;
  quantity: number;
  costPrice: number;
}

export interface PurchaseResponse {
  id: number;
  productName: string;
  category: string;
  quantity: number;
  costPrice: number;
  purchasedAt: string;
  purchasedByName: string;
  productRecordId: number | null;
  productCode: string | null;
}

export interface SaleRequest {
  productId: number;
  sellingPrice: number;
  quantity: number;
  soldAt?: string;
}

export interface SaleResponse {
  id: number;
  productId: number;
  productName: string;
  sellingPrice: number;
  quantity: number;
  totalPrice: number;
  soldByName: string;
  soldAt: string;
}

export interface StockResponse {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  quantityAvailable: number;
  updatedAt: string;
}

export interface WorkerRequest {
  fullname: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  gender: Gender;
}

export interface ActivityLogResponse {
  id: number;
  userName: string;
  action: string;
  entity: string;
  timeStamp: string;
}

export interface DailyProfitResponse {
  date: string;
  totalProfit: number;
}

export interface MonthlyProfitResponse {
  year: number;
  month: number;
  totalProfit: number;
}

export interface ProductProfitResponse {
  productId: number;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
