import { useId, useState, type FormEvent } from "react";
import { Button } from "@/atoms/Button";
import { Input } from "@/atoms/Input";
import { Select } from "@/atoms/Select";
import { useDriverSearch } from "@/hooks/driver/useDriverSearch";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox, type ComboOption } from "@/molecules/Combobox";
import { FormField } from "@/molecules/FormField";
import { Modal } from "@/organisms/Modal";
import type { Location, Order, Product } from "@/types";
import { todayStr } from "@/utils/date";

interface OrderFormModalProps {
  open: boolean;
  editing: Order | null;
  hubs: Location[];
  terminals: Location[];
  products: Product[];
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  saving?: boolean;
}

interface Errors {
  quantity?: string;
}

const OrderForm = ({ editing, hubs, terminals, products, onClose, onSave, saving }: Omit<OrderFormModalProps, "open">) => {
  const [sourceHubId, setSourceHubId] = useState(editing?.sourceHubId?._id ?? hubs[0]?._id ?? "");
  const [destinationId, setDestinationId] = useState(editing?.destinationId?._id ?? terminals[0]?._id ?? "");
  const [productId, setProductId] = useState(editing?.productId?._id ?? products[0]?._id ?? "");
  const [quantity, setQuantity] = useState(editing ? String(editing.quantity) : "");
  const [deliveryDate, setDeliveryDate] = useState(editing?.deliveryDate ?? todayStr());
  const [startTime, setDeliveryTime] = useState(editing?.startTime ?? "09:00");
  const [driver, setDriver] = useState<ComboOption | null>(
    editing?.assignedDriverId
      ? { id: editing.assignedDriverId._id, label: editing.assignedDriverId.name }
      : null,
  );
  const [driverSearch, setDriverSearch] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const qtyId = useId();
  const unit = products.find((p) => p._id === productId)?.unit;

  const debouncedDriver = useDebounce(driverSearch);
  const driverList = useDriverSearch(debouncedDriver);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (quantity === "" || Number.isNaN(qty) || qty < 1) {
      setErrors({ quantity: "Quantity must be at least 1." });
      return;
    }
    onSave({
      sourceHubId,
      destinationId,
      productId,
      quantity: qty,
      deliveryDate,
      ...(startTime ? { startTime } : {}),
      ...(driver ? { assignedDriverId: driver.id } : {}),
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Source hub">
          <Select value={sourceHubId} onChange={(e) => setSourceHubId(e.target.value)}>
            {hubs.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Destination">
          <Select value={destinationId} onChange={(e) => setDestinationId(e.target.value)}>
            {terminals.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Product">
          <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </Select>
        </FormField>
        <div className="space-y-1">
          <label htmlFor={qtyId} className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
            Quantity
          </label>
          <div className="relative">
            <Input
              id={qtyId}
              type="number"
              inputMode="numeric"
              className="pr-14 font-mono"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              invalid={!!errors.quantity}
              aria-invalid={errors.quantity ? true : undefined}
              placeholder="0"
            />
            {unit && (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-code-sm text-outline">
                {unit}
              </span>
            )}
          </div>
          {errors.quantity && <p className="font-mono text-label-caps text-critical">{errors.quantity}</p>}
        </div>
        <FormField label="Delivery date">
          <Input type="date" className="font-mono" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
        </FormField>
        <FormField label="Start time" hint="Stops run in time order">
          <Input type="time" className="font-mono" value={startTime} onChange={(e) => setDeliveryTime(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Driver (optional)">
        <Combobox
          value={driver}
          onSelect={setDriver}
          search={driverSearch}
          onSearchChange={setDriverSearch}
          options={driverList.items.map((d) => ({ id: d._id, label: d.name }))}
          isLoading={driverList.isLoading}
          hasMore={driverList.hasNextPage}
          isLoadingMore={driverList.isFetchingNextPage}
          onLoadMore={driverList.fetchNextPage}
          placeholder="Select driver…"
          searchPlaceholder="Search driver by name…"
          emptyLabel="No drivers"
        />
      </FormField>
      <footer className="mt-auto flex flex-col justify-end gap-3 pt-6 md:mt-6 md:flex-row">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {editing ? "Save changes" : "Create order"}
        </Button>
      </footer>
    </form>
  );
};

export const OrderFormModal = ({ open, editing, onClose, ...rest }: OrderFormModalProps) => (
  <Modal open={open} title={editing ? "Edit order" : "New order"} onClose={onClose}>
    <OrderForm key={editing?._id ?? "new"} editing={editing} onClose={onClose} {...rest} />
  </Modal>
);
