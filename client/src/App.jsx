import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

import { AdminHomePage } from "./pages/AdminHomePage";
import { AdminCustomerPage } from "./pages/AdminCustomerPage";
import { AdminStaffPage } from "./pages/AdminStaffPage";
import { AdminProductPage } from "./pages/AdminProductPage";
import { AdminPromotionPage } from "./pages/AdminPromotionPage";
import { AdminNotificationPage } from "./pages/AdminNotificationPage";

import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";

import { NotFoundPage } from "./pages/NotFoundPage";
import { ActivatePage } from "./pages/ActivatePage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/layouts/admin/ProtectedRoute";
import { Layout } from "./components/layouts/customer/Layout";
import { LayoutAdmin } from "./components/layouts/admin/LayoutAdmin";
import { PetPage } from "./pages/PetPage";

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
          path="/admin/staffs"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminStaffPage />} />}
            />
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminCustomerPage />} />}
            />
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminProductPage />} />}
            />
          }
        />
        <Route
          path="/admin/promotions"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminPromotionPage />} />}
            />
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminNotificationPage />} />}
            />
          }
        />

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/home">
          <Route index element={<Layout children={<HomePage />} />} />
          <Route path="me" element={<Layout children={<ProfilePage />} />}/>
          <Route path="pets" element={<Layout children={<PetPage />} />}/>
        </Route>

        <Route path="/activate" element={<ActivatePage />} />
        <Route path="/recovery-password" element={<ForgotPasswordPage />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
