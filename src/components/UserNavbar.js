import React, {
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import AppContext from "./Context";

import "../styling/UserNavbar.css";

const UserNavbar = () => {
  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  const {
    cart,
    data,
    selectedCategory,
    setSelectedCategory,
    refreshData,
    setProducts,
    user,
    logout,
    categoryRefresh,
  } = useContext(AppContext);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [showResults, setShowResults] =
    useState(false);

  const [categories, setCategories] =
    useState([]);

  const [showDropdown, setShowDropdown] =
    useState(false);

  // Logout handler
  const handleLogout = () => {
    if (
      window.confirm(
        "Are you sure you want to sign out?"
      )
    ) {
      // JWT authentication does not use a server session.
      // Remove the token through Context.
      logout();

      setSelectedCategory("");

      setSearchQuery("");

      navigate("/");
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "/api/categories"
        );

        setCategories(
          Array.isArray(response.data)
            ? response.data
            : []
        );

      } catch (error) {
        console.error(
          "Error retrieving store categories:",
          error
        );
      }
    };

    fetchCategories();
  }, [categoryRefresh]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleProductsClick = () => {
    setSelectedCategory("");

    setSearchQuery("");

    if (refreshData) {
      refreshData();
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      handleProductsClick();

      navigate("/products");

      return;
    }

    try {
      const response = await axios.get(
        "/api/products/search",
        {
          params: {
            keyword: searchQuery.trim(),
          },
        }
      );

      if (setProducts) {
        setProducts(response.data);
      }

      setSelectedCategory("");

      setShowResults(false);

      navigate("/");

      setTimeout(() => {
        const section =
          document.getElementById(
            "products-display-section"
          );

        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
          });
        }
      }, 100);

    } catch (error) {
      console.error(
        "Database search execution failure:",
        error
      );
    }
  };

  const filteredSearch = data
    ? data.filter((product) =>
        product.name
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        product.brand
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )
      )
    : [];

  const totalCartItems = cart
    ? cart.reduce(
        (total, item) =>
          total + item.quantity,
        0
      )
    : 0;

  return (
    <nav className="user-navbar">

      <div className="nav-container">

        <div className="nav-brand">

          <Link
            to="/"
            onClick={handleProductsClick}
          >
            <i className="bi bi-shop-window brand-icon"></i>{" "}
            ShopEase
          </Link>

        </div>

        <ul className="nav-menu">

          <li>
            <Link
              to="/"
              className="menu-link"
              onClick={handleProductsClick}
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              to="/products"
              className="menu-link"
              onClick={handleProductsClick}
            >
              Products
            </Link>
          </li>

          <li
            className="dropdown-wrapper"
            ref={dropdownRef}
          >

            <button
              className={`dropdown-toggle-btn ${
                showDropdown
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setShowDropdown(
                  !showDropdown
                )
              }
            >

              <span>
                {selectedCategory
                  ? selectedCategory
                  : "Browse Categories"}
              </span>

              <i
                className={`bi bi-chevron-down chevron ${
                  showDropdown
                    ? "rotate"
                    : ""
                }`}
              ></i>

            </button>

            {showDropdown && (

              <ul className="dropdown-menu-list">

                <li>

                  <button
                    className={`dropdown-item ${
                      selectedCategory === ""
                        ? "active-item"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedCategory("");

                      setSearchQuery("");

                      setShowDropdown(false);

                      if (refreshData) {
                        refreshData();
                      }

                      navigate("/");
                    }}
                  >
                    All Collections
                  </button>

                </li>

                <li className="menu-divider"></li>

                {categories.map((cat) => {

                  const categoryName =
                    cat.categoryName ||
                    cat.name;

                  if (!categoryName) {
                    return null;
                  }

                  return (
                    <li key={cat.id}>

                      <button
                        className={`dropdown-item ${
                          selectedCategory ===
                          categoryName
                            ? "active-item"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedCategory(
                            categoryName
                          );

                          setSearchQuery("");

                          setShowDropdown(false);

                          navigate("/");
                        }}
                      >

                        {categoryName
                          .charAt(0)
                          .toUpperCase() +
                          categoryName.slice(
                            1
                          )}

                      </button>

                    </li>
                  );
                })}

              </ul>
            )}

          </li>

        </ul>

        <div className="nav-utilities">

          <form
            onSubmit={handleSearchSubmit}
            className="search-bar-form-wrapper m-0 p-0"
          >

            <div className="search-bar-wrapper">

              <button
                type="submit"
                className="search-action-btn-trigger bg-transparent border-0 p-0 me-1"
              >
                <i className="bi bi-search search-inside-icon"></i>
              </button>

              <input
                type="text"
                className="user-search-input"
                placeholder="Search items, brands..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(
                    e.target.value
                  );

                  setShowResults(true);
                }}
                onFocus={() =>
                  setShowResults(true)
                }
                onBlur={() =>
                  setTimeout(
                    () =>
                      setShowResults(false),
                    250
                  )
                }
              />

              {showResults &&
                searchQuery && (

                  <ul className="predictive-search-results">

                    {filteredSearch.length >
                    0 ? (

                      filteredSearch
                        .slice(0, 6)
                        .map((product) => (

                          <li
                            key={product.id}
                          >

                            <Link
                              to={`/product/${product.id}`}
                              className="search-result-row"
                            >

                              <div className="d-flex flex-column">

                                <span className="fw-medium text-dark">
                                  {product.name}
                                </span>

                                <small className="text-muted text-xs">
                                  {product.brand}
                                </small>

                              </div>

                              <span className="badge bg-light text-success">
                                $
                                {Number(
                                  product.price
                                ).toFixed(2)}
                              </span>

                            </Link>

                          </li>

                        ))

                    ) : (

                      <li className="no-search-results text-center py-2 text-muted">
                        No matching items found
                      </li>

                    )}

                  </ul>

                )}

            </div>

          </form>

          <Link
            to="/cart"
            className="customer-cart-link"
            aria-label="View shopping cart"
          >

            <div className="cart-icon-container">

              <i className="bi bi-bag"></i>

              {totalCartItems > 0 && (

                <span className="cart-badge-counter">
                  {totalCartItems}
                </span>

              )}

            </div>

            <span className="cart-label">
              Cart
            </span>

          </Link>

          <div className="auth-nav-action-wrapper d-flex align-items-center ms-2 border-start ps-3">

            {user ? (

              <div className="user-profile-meta-display d-flex align-items-center gap-2">

                <i className="bi bi-person-circle fs-5 text-primary"></i>

                <div className="d-flex flex-column">

                  <span className="user-name-label small fw-semibold text-dark">
                    Hi,{" "}
                    {user.name || "User"}
                  </span>

                  {user.isAdmin && (

                    <span className="badge bg-danger text-xxs">
                      Admin
                    </span>

                  )}

                </div>

                <button
                  className="btn btn-outline-danger btn-sm ms-2"
                  onClick={handleLogout}
                  title="Sign Out"
                >

                  <i className="bi bi-box-arrow-right"></i>

                </button>

              </div>

            ) : (

              <Link
                to="/login"
                className="btn btn-primary btn-sm px-3 navbar-signin-action-btn fw-medium d-flex align-items-center gap-1"
              >

                <i className="bi bi-box-arrow-in-right"></i>

                Sign In

              </Link>

            )}

          </div>

        </div>

      </div>

    </nav>
  );
};

export default UserNavbar;