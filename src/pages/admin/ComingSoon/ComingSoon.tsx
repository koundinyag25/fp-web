import { useLocation } from "react-router-dom";
import { EmptyState } from "@/molecules/EmptyState";
import { PageHeader } from "@/molecules/PageHeader";

// Placeholder for admin routes whose screens aren't built yet (flows 2–4).
const ComingSoon = () => {
  const seg = useLocation().pathname.replace(/^\/admin\/?/, "").split("/")[0] || "section";
  const title = seg.charAt(0).toUpperCase() + seg.slice(1);
  return (
    <>
      <PageHeader title={title} />
      <EmptyState message={`The ${title} screen is coming in a later flow.`} />
    </>
  );
};

export default ComingSoon;
