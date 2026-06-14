import { http } from "@/utils/http";
import type { Movement } from "@/types";

export const movementService = {
  list: async (params?: Record<string, string>): Promise<Movement[]> =>
    (await http.get("/movements", { params })).data,
};
