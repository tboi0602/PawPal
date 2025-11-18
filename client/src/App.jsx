import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ActivatePage } from "./pages/ActivatePage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { StatusPage } from "./pages/StatusPage";

import { AdminHomePage } from "./pages/Admin/AdminHomePage";
import { AdminCustomerPage } from "./pages/Admin/AdminCustomerPage";
import { AdminStaffPage } from "./pages/Admin/AdminStaffPage";
import { AdminProductPage } from "./pages/Admin/AdminProductPage";
import { AdminPromotionPage } from "./pages/Admin/AdminPromotionPage";
import { AdminNotificationPage } from "./pages/Admin/AdminNotificationPage";
import { AdminOrderPage } from "./pages/Admin/AdminOrderPage";
import { AdminBookingPage } from "./pages/Admin/AdminBookingPage";
import { AdminResourcePage } from "./pages/Admin/AdminResourcePage";

import { HomePage } from "./pages/Customer/HomePage";
import { ProfilePage } from "./pages/Customer/ProfilePage";
import { PetPage } from "./pages/Customer/PetPage";
import { ProductPage } from "./pages/Customer/ProductPage";
import { ProductDetailsPage } from "./pages/Customer/ProductDetailsPage";
import { ProductPaymentPage } from "./pages/Customer/ProductPaymentPage";
import { OrderPage } from "./pages/Customer/OrderPage";
import { CartPage } from "./pages/Customer/CartPage";
import { PromotionPage } from "./pages/Customer/PromotionPage";
import { ServicePage } from "./pages/Customer/ServicePage";
import { BookingHistoryPage } from "./pages/Customer/BookingHistoryPage";

import { ProtectedRoute } from "./components/layouts/admin/ProtectedRoute";
import { Layout } from "./components/layouts/customer/Layout";
import { LayoutAdmin } from "./components/layouts/admin/LayoutAdmin";
import { AdminServicePage } from "./pages/Admin/AdminServicePage";
import StatusPaymentService from "./pages/Customer/StatusPaymentService";

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
          path="/admin/orders"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminOrderPage />} />}
            />
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminBookingPage />} />}
            />
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminServicePage />} />}
            />
          }
        />
        <Route
          path="/admin/resources"
          element={
            <ProtectedRoute
              children={<LayoutAdmin children={<AdminResourcePage />} />}
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
          <Route path="products">
            <Route index element={<Layout children={<ProductPage />} />} />
            <Route
              path="product-details"
              element={<Layout children={<ProductDetailsPage />} />}
            />
          </Route>
          <Route path="payment">
            <Route
              index
              element={<Layout children={<ProductPaymentPage />} />}
            />
            <Route
              path="status"
              element={<Layout children={<StatusPage />} />}
            />
          </Route>
          <Route path="orders" element={<Layout children={<OrderPage />} />} />
          <Route path="cart" element={<Layout children={<CartPage />} />} />
          <Route
            path="promotions"
            element={<Layout children={<PromotionPage />} />}
          />
          <Route
            path="services"
            element={<Layout children={<ServicePage />} />}
          />
          <Route
            path="bookings"
            element={<Layout children={<BookingHistoryPage />} />}
          />{" "}
          <Route
            path="booking-payment/status"
            element={<Layout children={<StatusPaymentService />} />}
          />
          <Route path="me" element={<Layout children={<ProfilePage />} />} />
          <Route path="pets" element={<Layout children={<PetPage />} />} />
        </Route>

        <Route path="/activate" element={<ActivatePage />} />
        <Route path="/recovery-password" element={<ForgotPasswordPage />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
