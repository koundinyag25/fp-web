import { http } from "@/utils/http";

export const deliveryService = {
  complete: (id: string) => http.post(`/deliveries/${id}/complete`),
  fail: (id: string, reason: string) => http.post(`/deliveries/${id}/fail`, { reason }),
};
