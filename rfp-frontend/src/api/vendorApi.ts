import { apiGet, apiPost } from "./client";

export interface Vendor {
  id: number;
  name: string;
  email: string;
  category?: string | null;
  notes?: string | null;
}

export async function listVendors() {
  return apiGet<{ vendors: Vendor[] }>("/api/vendors");
}

export async function createVendor(data: {
  name: string;
  email: string;
  category?: string;
  notes?: string;
}) {
  return apiPost<{ vendor: Vendor }>("/api/vendors", data);
}
