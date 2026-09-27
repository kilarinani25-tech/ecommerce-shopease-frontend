import React, { useContext, useEffect } from "react";

import AppContext from "../components/Context";

import ProductCard from "../components/ProductCard";

import "../styling/Home.css";

const UserHome = ({ shouldScrollToProducts = false }) => {
  const {
    data,
    selectedCategory,
    loading,
    error,
  } = useContext(AppContext);

  // Automatically shifts viewport visibility scope downward if route flag conditions match
  useEffect(() => {
    if (
      shouldScrollToProducts &&
      !loading &&
      data &&
      data.length > 0
    ) {
      const targetElement = document.getElementById(
        "products-display-section"
      );

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [shouldScrollToProducts, loading, data]);

  if (loading) {
    return (
      <div
        className="store-loader-container d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">
            Loading Catalog...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center mt-5">
        <div
          className="alert alert-danger"
          role="alert"
        >
          <h5>Glitches in the System</h5>

          <p>
            Unable to retrieve product inventory.
            Please check if your Spring Boot server is active.
          </p>
        </div>
      </div>
    );
  }

  const filteredProducts = data
    ? data.filter((product) => {
        if (!selectedCategory) return true;

        return (
          product.category?.categoryName?.toLowerCase() ===
          selectedCategory.toLowerCase()
        );
      })
    : [];

  return (
    <main className="storefront-layout">

      {/* ================= MODERN PREMIUM HERO SECTION ================= */}

      <section className="ecommerce-hero-section">

        <div className="hero-gradient-overlay"></div>

        <div className="container hero-content-wrapper">

          <div className="hero-text-block">

            <span className="hero-badge-tag">
              Summer Collection 2026
            </span>

            <h1 className="hero-main-title">
              {selectedCategory
                ? `${selectedCategory.toUpperCase()} COLLECTION`
                : "Discover Our Premium Showcase"}
            </h1>

            <p className="hero-subtitle">
              Explore high-quality, handpicked products
              curated exclusively for your premium lifestyle needs.
            </p>

            <div className="hero-action-buttons">

              <a
                href="#products-display-section"
                className="btn btn-primary hero-btn-main px-4 py-2 fw-bold me-3"
              >
                Shop Collections
                <i className="bi bi-arrow-right-short ms-1"></i>
              </a>

            </div>

          </div>

        </div>

      </section>

      {/* ================= PRODUCT DISPLAY MARKETPLACE ================= */}

      <div
        className="container my-5 pt-4"
        id="products-display-section"
        style={{ scrollMarginTop: "90px" }}
      >

        <div className="d-flex justify-content-between align-items-center mb-4">

          <h2 className="fw-bold text-dark section-heading">
            {selectedCategory
              ? `${selectedCategory} Items`
              : "Our Featured Products"}
          </h2>

          <span className="text-muted small fw-medium">
            {filteredProducts.length} Items found
          </span>

        </div>

        {filteredProducts.length > 0 ? (

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">

            {filteredProducts.map((product) => (

              <div
                className="col"
                key={product.id}
              >
                <ProductCard product={product} />
              </div>

            ))}

          </div>

        ) : (

          <div className="empty-catalog-fallback text-center py-5 border rounded bg-light">

            <i className="bi bi-box-open fallback-icon display-3 text-muted mb-3 d-block"></i>

            <h3 className="fw-semibold">
              No Products Found
            </h3>

            <p className="text-muted">
              We couldn't find any products listed under this
              category right now.
            </p>

          </div>

        )}

      </div>

    </main>
  );
};

export default UserHome;