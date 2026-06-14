import { useState, type FormEvent } from "react";
import { Button } from "@/atoms/Button";
import { Input } from "@/atoms/Input";
import { FormField } from "@/molecules/FormField";
import { Modal } from "@/organisms/Modal";
import type { Driver } from "@/types";

interface Props {
  open: boolean;
  editing: Driver | null;
  onClose: () => void;
  onSave: (data: Partial<Driver>) => void;
  saving?: boolean;
}

interface Errors {
  name?: string;
  phone?: string;
  license?: string;
}

const DriverForm = ({ editing, onClose, onSave, saving }: Omit<Props, "open">) => {
  const [name, setName] = useState(editing?.name ?? "");
  const [phone, setPhone] = useState(editing?.phone ?? "");
  const [license, setLicense] = useState(editing?.license ?? "");
  const [errors, setErrors] = useState<Errors>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (!name.trim()) errs.name = "Name is required.";
    if (phone.replace(/\D/g, "").length < 7) errs.phone = "Enter a valid phone number.";
    if (!license.trim()) errs.license = "License is required.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({ name: name.trim(), phone: phone.trim(), license: license.trim() });
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
      <FormField label="Name" error={errors.name}>
        <Input value={name} onChange={(e) => setName(e.target.value)} invalid={!!errors.name} />
      </FormField>
      <FormField label="Phone" error={errors.phone}>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          invalid={!!errors.phone}
          className="font-mono"
          inputMode="tel"
          placeholder="+91 90000 00000"
        />
      </FormField>
      <FormField label="License" error={errors.license}>
        <Input
          value={license}
          onChange={(e) => setLicense(e.target.value)}
          invalid={!!errors.license}
          className="font-mono"
        />
      </FormField>
      <footer className="mt-auto flex flex-col justify-end gap-3 pt-6 md:mt-6 md:flex-row">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          Save driver
        </Button>
      </footer>
    </form>
  );
};

export const DriverFormModal = ({ open, editing, onClose, onSave, saving }: Props) => (
  <Modal open={open} title={editing ? "Edit driver" : "New driver"} onClose={onClose}>
    <DriverForm key={editing?._id ?? "new"} editing={editing} onClose={onClose} onSave={onSave} saving={saving} />
  </Modal>
);
