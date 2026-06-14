import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DriverHome from "./pages/driver/DriverHome";
import Home from "./pages/Home";

// No auth — persona is chosen by route (FRD §8.6).
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/driver/:driverId/*" element={<DriverHome />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
