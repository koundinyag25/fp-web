import { SearchInput } from "@/atoms/SearchInput";
import { MetricCard } from "@/molecules/MetricCard";
import { WeekNavigator } from "@/molecules/WeekNavigator";
import { AllocationCalendar } from "@/organisms/AllocationCalendar";
import { useAllocationsPage } from "./useAllocationsPage";
import { AllocationFormModal } from "./AllocationFormModal";

const Allocations = () => {
  const p = useAllocationsPage();

  return (
    <>
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-6">
          <h1 className="text-headline-md text-on-surface">Allocations</h1>
          <WeekNavigator label={p.label} onPrev={p.prevWeek} onNext={p.nextWeek} onToday={p.today} />
        </div>
        <SearchInput
          widthClass="w-full md:w-72"
          placeholder="Search registration or type…"
          value={p.search}
          onChange={(e) => p.setSearch(e.target.value)}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:max-w-md">
        <MetricCard label="Fleet" value={p.summary?.fleet ?? "—"} />
        <MetricCard label="Allocated this week" value={p.summary?.allocated ?? "—"} />
      </div>

      <AllocationCalendar
        vehicles={p.vehicles}
        days={p.days}
        allocations={p.allocations}
        onAllocate={p.openAllocate}
        onRemove={p.removeAllocation}
        isLoading={p.isLoading}
        hasMore={p.hasMore}
        isLoadingMore={p.isLoadingMore}
        onLoadMore={p.loadMore}
      />

      <AllocationFormModal
        open={p.modalOpen}
        vehicle={p.prefill.vehicle}
        date={p.prefill.date}
        error={p.error}
        onClose={p.closeModal}
        onSave={p.save}
        saving={p.saving}
      />
    </>
  );
};

export default Allocations;
