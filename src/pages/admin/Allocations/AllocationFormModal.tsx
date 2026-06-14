import { useState, type FormEvent } from "react";
import { Button } from "@/atoms/Button";
import { useAvailableDrivers } from "@/hooks/driver/useAvailableDrivers";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox, type ComboOption } from "@/molecules/Combobox";
import { FormField } from "@/molecules/FormField";
import { Modal } from "@/organisms/Modal";
import type { Vehicle } from "@/types";

interface AllocationFormModalProps {
  open: boolean;
  vehicle: Vehicle | null;
  date: string;
  error: string | null;
  onClose: () => void;
  onSave: (driverId: string) => void;
  saving?: boolean;
}

const AllocationForm = ({
  vehicle,
  date,
  error,
  onClose,
  onSave,
  saving,
}: Omit<AllocationFormModalProps, "open">) => {
  const [driver, setDriver] = useState<ComboOption | null>(null);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);
  const free = useAvailableDrivers(date, debounced);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!driver) return;
    onSave(driver.id);
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
      {error && (
        <div className="rounded border border-critical bg-critical/10 p-3">
          <p className="text-body-sm text-critical">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded border border-border-hairline bg-surface-recessed px-3 py-2">
          <span className="block font-mono text-label-caps uppercase text-outline">Vehicle</span>
          <span className="font-mono text-code-md text-on-surface">{vehicle?.reg}</span>
        </div>
        <div className="rounded border border-border-hairline bg-surface-recessed px-3 py-2">
          <span className="block font-mono text-label-caps uppercase text-outline">Date</span>
          <span className="font-mono text-code-md text-on-surface">{date}</span>
        </div>
      </div>
      <FormField label="Driver (free this day)">
        <Combobox
          value={driver}
          onSelect={setDriver}
          search={search}
          onSearchChange={setSearch}
          options={free.items.map((d) => ({ id: d._id, label: d.name }))}
          isLoading={free.isLoading}
          hasMore={free.hasNextPage}
          isLoadingMore={free.isFetchingNextPage}
          onLoadMore={free.fetchNextPage}
          placeholder="Select driver…"
          searchPlaceholder="Search driver by name…"
          emptyLabel="No free drivers"
          invalid={!!error}
        />
      </FormField>
      <footer className="mt-auto flex flex-col justify-end gap-3 pt-6 md:mt-6 md:flex-row">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving || !driver}>
          Allocate
        </Button>
      </footer>
    </form>
  );
};

export const AllocationFormModal = ({ open, vehicle, date, ...rest }: AllocationFormModalProps) => (
  <Modal open={open} title="Allocate vehicle" onClose={rest.onClose}>
    <AllocationForm key={`${vehicle?._id ?? ""}|${date}`} vehicle={vehicle} date={date} {...rest} />
  </Modal>
);
