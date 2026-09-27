import React, { useContext, useState, useEffect, useRef } from "react";

import { Link, useNavigate } from "react-router-dom";

import axios from "axios";

import AppContext from "../components/Context";

import "../styling/Home.css";

import "../styling/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  const {
    cart,
    data,
    refreshData,
    selectedCategory,
    setSelectedCategory,
    user,
    logout,
    setProducts,
    categoryRefresh,
    triggerCategoryRefresh
  } = useContext(AppContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter logic for predictive search
  const filteredSearch =
    data?.filter(
      (product) =>
        product.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        product.brand
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    ) || [];

  // Fetch categories reactive to global categoryRefresh
  useEffect(() => {
    const fetchBackendCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/categories"
        );

        setCategories(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    fetchBackendCategories();
  }, [categoryRefresh]);

  // Handle outside clicks to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      handleResetFilters();
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:8080/api/products/search",
        {
          params: {
            keyword: searchQuery
          }
        }
      );

      if (setProducts) {
        setProducts(response.data);
      }

      setShowResults(false);
      navigate("/");
    } catch (error) {
      console.error("Search execution failed:", error);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");

    if (refreshData) {
      refreshData();
    }

    setShowDropdown(false);
    setShowResults(false);
  };

  const handleDeleteCategory = async (e, id, categoryName) => {
    e.stopPropagation();

    if (
      !window.confirm(
        `Are you sure you want to delete "${categoryName}"?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:8080/api/categories/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (selectedCategory === categoryName) {
        setSelectedCategory("");
      }

      triggerCategoryRefresh();
      navigate("/");
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category.");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg px-4 py-3 shadow-sm bg-blue-600 text-white">

      {/* Brand Section */}
      <div className="logo-section d-flex align-items-center gap-2">
        <Link
          to="/"
          className="navbar-brand text-xl font-bold text-white"
          onClick={handleResetFilters}
        >
          ShopEase
        </Link>

        {user?.isAdmin && (
          <span className="badge bg-warning text-dark px-2 rounded-pill">
            Admin Mode
          </span>
        )}
      </div>

      {/* Nav Links */}
      <ul className="nav-links d-flex align-items-center list-unstyled gap-4 m-0">

        <li>
          <Link
            to="/"
            className="nav-link text-white"
            onClick={handleResetFilters}
          >
            Home
          </Link>
        </li>

        {user?.isAdmin && (
          <li>
            <Link
              to="/admin/add-product"
              className="text-white fw-bold"
            >
              <i className="bi bi-box-seam-fill"></i> Add Product
            </Link>
          </li>
        )}

        {/* Category Dropdown */}
        <li
          className="position-relative"
          ref={dropdownRef}
        >
          <button
            className="btn btn-light btn-sm"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {selectedCategory || "Categories"}
          </button>

          {showDropdown && (
            <ul
              className="dropdown-menu show position-absolute end-0 mt-2 p-2"
              style={{ minWidth: "220px" }}
            >
              <li>
                <button
                  className="dropdown-item"
                  onClick={handleResetFilters}
                >
                  All Products
                </button>
              </li>

              <li className="dropdown-divider"></li>

              {categories.map((cat) => {
                const categoryName =
                  cat.categoryName || cat.name;

                return (
                  <li
                    key={cat.id}
                    className="d-flex align-items-center px-2"
                  >
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setSelectedCategory(categoryName);
                        setShowDropdown(false);
                      }}
                    >
                      {categoryName.charAt(0).toUpperCase() +
                        categoryName.slice(1)}
                    </button>

                    {user?.isAdmin && (
                      <button
                        className="btn btn-link text-danger p-0"
                        onClick={(e) =>
                          handleDeleteCategory(
                            e,
                            cat.id,
                            categoryName
                          )
                        }
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                    )}
                  </li>
                );
              })}

              {user?.isAdmin && (
                <li>
                  <button
                    className="btn btn-warning btn-sm w-100 mt-2"
                    onClick={() =>
                      navigate("/admin/add-category")
                    }
                  >
                    Manage Categories
                  </button>
                </li>
              )}
            </ul>
          )}
        </li>
      </ul>

      {/* Utilities */}
      <div className="d-flex align-items-center gap-3">

        <form
          onSubmit={handleSearchSubmit}
          className="position-relative"
        >
          <input
            className="form-control form-control-sm rounded-pill"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
          />

          {showResults && searchQuery && (
            <ul className="search-results dropdown-menu show mt-1 w-100 p-2">
              {filteredSearch.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/product/${p.id}`}
                    className="dropdown-item"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </form>

        <Link to="/cart" className="text-white">
          Cart (
          {cart?.reduce(
            (total, item) => total + item.quantity,
            0
          ) || 0}
          )
        </Link>

        {user ? (
          <button
            className="btn btn-danger btn-sm"
            onClick={logout}
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="btn btn-light btn-sm"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;