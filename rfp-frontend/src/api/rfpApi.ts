import { apiGet, apiPost } from "./client";

export interface Rfp {
  id: number;
  title: string;
  descriptionRaw: string;
  budget: number | null;
  deliveryDeadline: string | null;
  paymentTerms: string | null;
  warrantyMinMonths: number | null;
  items: any[] | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function generateRfp(description: string) {
  return apiPost<{ rfp: Rfp }>("/api/rfps/generate", { description });
}

export async function listRfps() {
  return apiGet<{ rfps: Rfp[] }>("/api/rfps");
}

export async function getRfp(id: number) {
  return apiGet<{ rfp: Rfp }>(`/api/rfps/${id}`);
}
