import React, { useContext } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import AppContext, {
  AppProvider
} from "./components/Context";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Global Layout Components
import UserNavbar from "./components/UserNavbar";
import Navbar from "./components/Navbar";
import Footer from "./pages/Footer";

// Pages
import UserHome from "./pages/UserHome";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import AuthPage from "./pages/AuthPage";
import AddProduct from "./pages/AddProduct";
import UpdateProduct from "./components/UpdateProduct";
import AddCategory from "./pages/AddCategory";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./App.css";

// Route Guard: Protected for Authenticated Users
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AppContext);

  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname
        }}
        replace
      />
    );
  }

  return children;
};

// Route Guard: Admin-Only Access
const AdminRoute = ({ children }) => {
  const { user } = useContext(AppContext);

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!user.isAdmin) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};

function AppContent() {
  const { user } = useContext(AppContext);

  return (
    <>
      {/* Dynamic Navbar: Admin vs User */}
      {user?.isAdmin ? <Navbar /> : <UserNavbar />}

      <Routes>

        {/* PUBLIC ROUTES */}

        <Route
          path="/"
          element={<UserHome />}
        />

        <Route
          path="/products"
          element={
            <UserHome shouldScrollToProducts={true} />
          }
        />

        <Route
          path="/login"
          element={<AuthPage />}
        />

        {/* AUTHENTICATED ROUTES */}

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ROUTES */}

        <Route
          path="/admin/add-product"
          element={
            <AdminRoute>
              <AddProduct />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/add-category"
          element={
            <AdminRoute>
              <AddCategory />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/product/update/:id"
          element={
            <AdminRoute>
              <UpdateProduct />
            </AdminRoute>
          }
        />

        {/* CATCH-ALL */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

      <Footer />

      {/* Global Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;