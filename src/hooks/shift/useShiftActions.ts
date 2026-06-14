import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import { shiftService } from "@/lib/services/shift";
import { apiError } from "@/utils/apiError";

export const useShiftActions = (driverId: string) => {
  const qc = useQueryClient();
  const { show } = useToast();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["today", driverId] });
  return {
    start: useMutation({
      mutationFn: () => shiftService.start(driverId),
      onSuccess: () => {
        invalidate();
        show({ tone: "success", message: "Shift started." });
      },
      onError: (e) => show({ tone: "error", message: apiError(e, "Couldn't start the shift.") }),
    }),
    end: useMutation({
      mutationFn: (shiftId: string) => shiftService.end(shiftId),
      onSuccess: () => {
        invalidate();
        show({ tone: "success", message: "Shift ended." });
      },
      onError: (e) => show({ tone: "error", message: apiError(e, "Couldn't end the shift.") }),
    }),
  };
};
