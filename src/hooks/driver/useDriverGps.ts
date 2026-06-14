import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driverService } from "@/lib/services/driver";

/** Manual + auto GPS controls for a driver; refreshes today's shift on success. */
export const useDriverGps = (driverId: string) => {
  const qc = useQueryClient();
  const onSuccess = () => qc.invalidateQueries({ queryKey: ["today", driverId] });
  return {
    sendGps: useMutation({ mutationFn: () => driverService.sendGps(driverId), onSuccess }),
    // replay=true rewinds the leg to its source so "Start trip" always drives the
    // whole route from the origin (even if the ambient stepper nudged it first).
    startDrive: useMutation({
      mutationFn: (replay?: boolean) => driverService.startDrive(driverId, replay ?? false),
      onSuccess,
    }),
    stopDrive: useMutation({ mutationFn: () => driverService.stopDrive(driverId), onSuccess }),
  };
}
