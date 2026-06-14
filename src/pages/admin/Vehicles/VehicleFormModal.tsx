import { useState, type FormEvent } from "react";
import { Button } from "@/atoms/Button";
import { Input } from "@/atoms/Input";
import { Select } from "@/atoms/Select";
import { FormField } from "@/molecules/FormField";
import { Modal } from "@/organisms/Modal";
import type { Vehicle } from "@/types";
import { VEHICLE_TYPES } from "@/types/constants";

interface Props {
  open: boolean;
  editing: Vehicle | null;
  onClose: () => void;
  onSave: (data: Partial<Vehicle>) => void;
  saving?: boolean;
}

interface Errors {
  reg?: string;
  capacity?: string;
}

const VehicleForm =({ editing, onClose, onSave, saving }: Omit<Props, "open">) => {
  const [reg, setReg] = useState(editing?.reg ?? "");
  const [type, setType] = useState(editing?.type ?? "tanker");
  const [capacity, setCapacity] = useState(editing?.capacity != null ? String(editing.capacity) : "");
  const [errors, setErrors] = useState<Errors>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const capN = Number(capacity);
    const errs: Errors = {};
    if (!reg.trim()) errs.reg = "Registration is required.";
    if (capacity === "" || Number.isNaN(capN) || capN < 0) errs.capacity = "Capacity must be 0 or more.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({ reg: reg.trim(), type, capacity: capN });
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
      <FormField label="Reg" error={errors.reg}>
        <Input
          value={reg}
          onChange={(e) => setReg(e.target.value)}
          invalid={!!errors.reg}
          className="font-mono"
          placeholder="KA01AB1234"
        />
      </FormField>
      <FormField label="Type">
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          {VEHICLE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Capacity (L)" error={errors.capacity}>
        <Input
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          invalid={!!errors.capacity}
          className="font-mono"
          type="number"
          inputMode="numeric"
          placeholder="0"
        />
      </FormField>
      <footer className="mt-auto flex flex-col justify-end gap-3 pt-6 md:mt-6 md:flex-row">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          Save vehicle
        </Button>
      </footer>
    </form>
  );
};

export const VehicleFormModal = ({ open, editing, onClose, onSave, saving }: Props) => (
  <Modal open={open} title={editing ? "Edit vehicle" : "New vehicle"} onClose={onClose}>
    <VehicleForm key={editing?._id ?? "new"} editing={editing} onClose={onClose} onSave={onSave} saving={saving} />
  </Modal>
);
