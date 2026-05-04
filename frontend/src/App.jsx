import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login      from "./pages/Login";
import Signup     from "./pages/Signup";
import VerifyOtp  from "./pages/VerifyOtp";
import Dashboard  from "./pages/Dashboard";
import ParkingList from "./pages/ParkingList";
import CarEntry   from "./pages/CarEntry";
import CarExit    from "./pages/CarExit";
import Reports    from "./pages/Reports";
import ActiveCars from "./pages/ActiveCars";
import Users      from "./pages/Users";
import "./App.css";

function DashboardLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"      element={<Login />} />
          <Route path="/signup"     element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/parking"    element={<ParkingList />} />
            <Route path="/car-entry"  element={<CarEntry />} />
            <Route path="/car-exit"    element={<CarExit />} />
            <Route path="/active-cars" element={<ActiveCars />} />
            <Route
              path="/reports"
              element={
                <AdminRoute>
                  <Reports />
                </AdminRoute>
              }
            />
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
