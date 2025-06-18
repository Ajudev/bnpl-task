// import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import MerchantDashboard from "./components/Merchant/MerchantDashboard";
import UserDashboard from "./components/User/UserDashboard";
import CreatePlan from "./components/Merchant/CreatePlan";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Navbar from "./components/Layout/Navbar";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/merchant/dashboard"
              element={
                <ProtectedRoute requiredRole="merchant">
                  <MerchantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/merchant/create-plan"
              element={
                <ProtectedRoute requiredRole="merchant">
                  <CreatePlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute requiredRole="customer">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
