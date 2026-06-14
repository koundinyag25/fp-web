import { Navigate, Route, Routes } from "react-router-dom";
import { AdminShell } from "@/organisms/AdminShell";
import ComingSoon from "@/pages/admin/ComingSoon";
import Dashboard from "@/pages/admin/Dashboard";
import Allocations from "@/pages/admin/Allocations";
import Drivers from "@/pages/admin/Drivers";
import FleetMap from "@/pages/admin/FleetMap";
import Inventory from "@/pages/admin/Inventory";
import Locations from "@/pages/admin/Locations";
import Orders from "@/pages/admin/Orders";
import Products from "@/pages/admin/Products";
import Vehicles from "@/pages/admin/Vehicles";
import DriverHome from "@/pages/driver/DriverHome";
import TripDetail from "@/pages/driver/TripDetail";
import Home from "@/pages/Home";

// No auth — persona is chosen by route (FRD §8.6). Admin screens render inside
// AdminShell via <Outlet/>; unbuilt sections fall back to ComingSoon (flows 2–4).
const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/admin" element={<AdminShell />}>
      <Route index element={<Dashboard />} />
      <Route path="locations" element={<Locations />} />
      <Route path="products" element={<Products />} />
      <Route path="drivers" element={<Drivers />} />
      <Route path="vehicles" element={<Vehicles />} />
      <Route path="orders" element={<Orders />} />
      <Route path="allocations" element={<Allocations />} />
      <Route path="fleet" element={<FleetMap />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="*" element={<ComingSoon />} />
    </Route>
    <Route path="/driver/:driverId">
      <Route index element={<DriverHome />} />
      <Route path="trip/:deliveryId" element={<TripDetail />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
