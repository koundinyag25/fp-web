import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useAllocations } from "@/hooks/allocation/useAllocations";
import { useAllocationMutations } from "@/hooks/allocation/useAllocationMutations";
import { useAllocationSummary } from "@/hooks/allocation/useAllocationSummary";
import { useDebounce } from "@/hooks/useDebounce";
import { useVehicles } from "@/hooks/vehicle/useVehicles";
import type { Vehicle } from "@/types";
import { mondayOf, weekDays, weekLabel } from "@/utils/date";

export const useAllocationsPage = () => {
  const [anchor, setAnchor] = useState(() => dayjs());
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ vehicle: Vehicle | null; date: string }>({ vehicle: null, date: "" });
  const [error, setError] = useState<string | null>(null);

  const monday = useMemo(() => mondayOf(anchor), [anchor]);
  const days = useMemo(() => weekDays(monday), [monday]);
  const range = useMemo(() => ({ from: days[0].date, to: days[6].date }), [days]);

  const debouncedSearch = useDebounce(search, 300);
  const vehicleParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (debouncedSearch.trim()) p.q = debouncedSearch.trim(); // matches reg or type
    return p;
  }, [debouncedSearch]);

  const vehicles = useVehicles(vehicleParams);
  const allocationsQuery = useAllocations(range);
  const summary = useAllocationSummary(range);
  const mutations = useAllocationMutations();

  // Empty cells only offer free vehicles, so a 409 means the vehicle was booked
  // for that day in another tab/session between render and save (FR-VA-3).
  const conflictMessage = (err: unknown, reg: string, date: string): string => {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status !== 409) return "Could not allocate. Please try again.";
    return `✘ ${reg} is already allocated on ${date}. Pick another day or vehicle.`;
  };

  const openAllocate = (vehicle: Vehicle, date: string) => {
    setPrefill({ vehicle, date });
    setError(null);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setError(null);
  };

  const save = (driverId: string) => {
    const { vehicle, date } = prefill;
    if (!vehicle) return;
    setError(null);
    mutations.create.mutate(
      { vehicleId: vehicle._id, driverId, date },
      {
        onSuccess: closeModal,
        onError: (err) => setError(conflictMessage(err, vehicle.reg, date)),
      }
    );
  };

  return {
    label: weekLabel(monday),
    days,
    search,
    setSearch,
    vehicles: vehicles.items,
    isLoading: vehicles.isLoading,
    hasMore: vehicles.hasNextPage,
    isLoadingMore: vehicles.isFetchingNextPage,
    loadMore: vehicles.fetchNextPage,
    allocations: allocationsQuery.data ?? [],
    summary: summary.data,
    prevWeek: () => setAnchor((a) => a.subtract(7, "day")),
    nextWeek: () => setAnchor((a) => a.add(7, "day")),
    today: () => setAnchor(dayjs()),
    modalOpen,
    prefill,
    error,
    saving: mutations.create.isPending,
    openAllocate,
    closeModal,
    save,
    removeAllocation: (id: string) => mutations.remove.mutate(id),
  };
};
