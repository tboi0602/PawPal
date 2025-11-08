import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

import { AdminHomePage } from "./pages/AdminHomePage";
import { AdminCustomerPage } from "./pages/AdminCustomerPage";
import { AdminStaffPage } from "./pages/AdminStaffPage";
import { AdminProductPage } from "./pages/AdminProductPage";
import { AdminPromotionPage } from "./pages/AdminPromotionPage";

import { HomePage } from "./pages/HomePage";

import { NotFoundPage } from "./pages/NotFoundPage";
import { ActivatePage } from "./pages/ActivatePage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/layouts/admin/ProtectedRoute";
import { Layout } from "./components/layouts/customer/Layout";
import { LayoutAdmin } from "./components/layouts/admin/LayoutAdmin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminHomePage />} />}
            />
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminStaffPage />} />}
            />
          }
        />
        <Route
          path="/admin/customer"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminCustomerPage />} />}
            />
          }
        />
        <Route
          path="/admin/product"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminProductPage />} />}
            />
          }
        />
        <Route
          path="/admin/promotion"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminPromotionPage />} />}
            />
          }
        />
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/home"
          element={<Layout children={<HomePage />} />}
        ></Route>

        <Route path="/activate" element={<ActivatePage />} />
        <Route path="/recovery-password" element={<ForgotPasswordPage />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
