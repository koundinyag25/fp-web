import { useToast } from "@/hooks/useToast";
import { apiError } from "@/utils/apiError";

/** Standard success/error toasts for create / update / delete on an entity. */
export const useCrudToasts = (entity: string) => {
  const { show } = useToast();
  const noun = entity.toLowerCase();
  return {
    created: () => show({ tone: "success", message: `${entity} created.` }),
    updated: () => show({ tone: "success", message: `${entity} updated.` }),
    deleted: () => show({ tone: "success", message: `${entity} deleted.` }),
    failed: (verb: string) => (e: unknown) =>
      show({ tone: "error", message: apiError(e, `Couldn't ${verb} the ${noun}.`) }),
  };
};
