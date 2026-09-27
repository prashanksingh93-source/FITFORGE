import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Toaster } from "sonner";

import Layout from "./layouts/Layout";

// =====================================================
// CUSTOMER PAGES
// =====================================================

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Checkout from "./pages/Checkout";
import Settings from "./pages/Settings";

// =====================================================
// LIVE DELIVERY TRACKING
// =====================================================

import TrackOrder from "./pages/TrackOrder";
import DeliveryTracking from "./pages/DeliveryTracking";

// =====================================================
// ADMIN
// =====================================================

import AdminRoute from "./admin/AdminRoute";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProducts from "./admin/AdminProducts";
import AdminProductForm from "./admin/AdminProductForm";
import AdminOrders from "./admin/AdminOrders";
import AdminOrderDetails from "./admin/AdminOrderDetails";
import AdminCustomers from "./admin/AdminCustomers";
import AdminCustomerDetails from "./admin/AdminCustomerDetails";
import AdminInventory from "./admin/AdminInventory";
import AdminHomepage from "./admin/AdminHomepage";
import AdminCategories from "./admin/AdminCategories";
import AdminReviews from "./admin/AdminReviews";
import AdminCoupons from "./admin/AdminCoupons";
import AdminSettings from "./admin/AdminSettings";
import AdminPayments from "./admin/AdminPayments";

// =====================================================
// AUTH / COMPONENTS
// =====================================================

import { useAuth } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import AnimatedRoutes from "./components/AnimatedRoutes";

// =====================================================
// LOADING SCREEN
// =====================================================

const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-black" />

        <p className="text-sm font-medium tracking-wide text-neutral-500">
          LOADING FITFORGE
        </p>
      </div>
    </div>
  );
};

// =====================================================
// CUSTOMER PROTECTED ROUTE
// =====================================================

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// =====================================================
// APP
// =====================================================

const App = () => {
  return (
    <BrowserRouter>
      {/* =================================================
          GLOBAL SCROLL
      ================================================== */}

      <ScrollToTop />

      {/* =================================================
          TOASTER
      ================================================== */}

      <Toaster
        position="top-right"
        richColors
        closeButton
      />

      {/* =================================================
          ALL ROUTES
      ================================================== */}

      <Routes>

        {/* =================================================
            CUSTOMER LAYOUT
        ================================================== */}

        <Route element={<Layout />}>

          {/* =================================================
              ANIMATED CUSTOMER PAGES
          ================================================== */}

          <Route element={<AnimatedRoutes />}>

            {/* =================================================
                HOME
            ================================================== */}

            <Route
              path="/"
              element={<Home />}
            />

            {/* =================================================
                SHOP
            ================================================== */}

            <Route
              path="/shop"
              element={
                <Shop
                  excludeCollection="Luxury"
                />
              }
            />

            {/* =================================================
                PERFORMANCE
            ================================================== */}

            <Route
              path="/performance"
              element={
                <Shop collection="Performance" />
              }
            />

            {/* =================================================
                LUXURY
            ================================================== */}

            <Route
              path="/luxury"
              element={
                <Shop collection="Luxury" />
              }
            />

            {/* =================================================
                CUSTOMER SETTINGS
            ================================================== */}

            <Route
              path="/settings"
              element={<Settings />}
            />

            {/* =================================================
                PRODUCT DETAILS
            ================================================== */}

            <Route
              path="/product/:id"
              element={<ProductDetails />}
            />

            {/* =================================================
                CART
            ================================================== */}

            <Route
              path="/cart"
              element={<Cart />}
            />

            {/* =================================================
                WISHLIST
            ================================================== */}

            <Route
              path="/wishlist"
              element={<Wishlist />}
            />

            {/* =================================================
                LOGIN
            ================================================== */}

            <Route
              path="/login"
              element={<Login />}
            />

            {/* =================================================
                REGISTER
            ================================================== */}

            <Route
              path="/register"
              element={<Register />}
            />

            {/* =================================================
                PROFILE
            ================================================== */}

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                ORDERS
            ================================================== */}

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                ORDER DETAILS
            ================================================== */}

            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                CHECKOUT
            ================================================== */}

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                CUSTOMER LIVE ORDER TRACKING
            ==================================================

                Example:
                /orders/68abc123/track

            ================================================== */}

            <Route
              path="/orders/:id/track"
              element={
                <ProtectedRoute>
                  <TrackOrder />
                </ProtectedRoute>
              }
            />

          </Route>
        </Route>

        {/* =================================================
            DELIVERY PARTNER LIVE TRACKING
        ==================================================

            Example:
            /delivery/68abc123

            The delivery partner opens this page
            and explicitly starts location sharing.

        ================================================== */}

        <Route
          path="/delivery/:orderId"
          element={
            <ProtectedRoute>
              <DeliveryTracking />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ADMIN LOGIN
        ================================================== */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* =================================================
            ADMIN DASHBOARD
        ================================================== */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN PRODUCTS
        ================================================== */}

        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADD PRODUCT
        ================================================== */}

        <Route
          path="/admin/products/add"
          element={
            <AdminRoute>
              <AdminProductForm />
            </AdminRoute>
          }
        />

        {/* =================================================
            EDIT PRODUCT
        ================================================== */}

        <Route
          path="/admin/products/edit/:id"
          element={
            <AdminRoute>
              <AdminProductForm />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN CATEGORIES
        ================================================== */}

        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN ORDERS
        ================================================== */}

        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN ORDER DETAILS
        ================================================== */}

        <Route
          path="/admin/orders/:id"
          element={
            <AdminRoute>
              <AdminOrderDetails />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN CUSTOMERS
        ================================================== */}

        <Route
          path="/admin/customers"
          element={
            <AdminRoute>
              <AdminCustomers />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN CUSTOMER DETAILS
        ================================================== */}

        <Route
          path="/admin/customers/:id"
          element={
            <AdminRoute>
              <AdminCustomerDetails />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN INVENTORY
        ================================================== */}

        <Route
          path="/admin/inventory"
          element={
            <AdminRoute>
              <AdminInventory />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN HOMEPAGE
        ================================================== */}

        <Route
          path="/admin/homepage"
          element={
            <AdminRoute>
              <AdminHomepage />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN REVIEWS
        ================================================== */}

        <Route
          path="/admin/reviews"
          element={
            <AdminRoute>
  <AdminReviews />
</AdminRoute>
          }
        />

        {/* =================================================
            ADMIN COUPONS
        ================================================== */}

        <Route
          path="/admin/coupons"
          element={
           <AdminRoute>
  <AdminReviews />
</AdminRoute>
          }
        />

        {/* =================================================
            ADMIN SETTINGS
        ================================================== */}

        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN PAYMENTS
        ================================================== */}

        <Route
          path="/admin/payments"
          element={
            <AdminRoute>
              <AdminPayments />
            </AdminRoute>
          }
        />

        {/* =================================================
            404
        ================================================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;

