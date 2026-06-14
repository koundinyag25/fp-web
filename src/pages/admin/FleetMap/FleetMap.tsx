import { FleetMap as FleetMapView } from "@/organisms/FleetMap";

/** Admin live fleet map page (FR-LM). Fills the viewport so the map (and its
 *  "Live fleet" header with search + filters) has real height to render into. */
const FleetMap = () => (
  <div className="flex h-[calc(100vh-4rem)] flex-col pb-6">
    <div className="min-h-0 flex-1">
      <FleetMapView />
    </div>
  </div>
);

export default FleetMap;
