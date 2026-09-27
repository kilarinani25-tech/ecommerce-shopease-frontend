import { useNavigate, useParams } from "react-router-dom";

import {
  useContext,
  useEffect,
  useState,
} from "react";

import AppContext from "../components/Context";

import axios from "axios";

import "../styling/Product.css";

const Product = () => {
  const { id } = useParams();

  const {
    addToCart,
    removeFromCart,
    refreshData,
    user,
  } = useContext(AppContext);

  const [product, setProduct] = useState(null);

  const [imageUrl, setImageUrl] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/products/${id}`
        );

        setProduct(response.data);

      } catch (error) {
        console.error(
          "Error fetching product details:",
          error
        );
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;

    const fetchImage = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/products/${id}/image`,
          {
            responseType: "blob",
          }
        );

        const url = URL.createObjectURL(response.data);

        setImageUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };

      } catch (error) {
        console.error(
          "Error fetching product image pipeline:",
          error
        );
      }
    };

    fetchImage();

  }, [product, id]);

  const deleteProduct = async () => {

    if (
      !window.confirm(
        "Are you sure you want to permanently delete this product?"
      )
    ) {
      return;
    }

    try {

      await axios.delete(
        `http://localhost:8080/api/products/${id}`
      );

      if (removeFromCart) {
        removeFromCart(id);
      }

      alert("Product deleted successfully");

      if (refreshData) {
        refreshData();
      }

      navigate("/");

    } catch (error) {

      console.error(
        "Error executing database item removal:",
        error
      );

      alert(
        "Failed to delete product. Verify permissions."
      );
    }
  };

  const handleEditClick = () => {

    // FIX: Aligned precisely with your AppRoute declaration blueprint
    navigate(`/admin/product/update/${id}`);
  };

  const handleAddToCartAction = () => {

    addToCart(product);

    alert(`${product.name} added to cart!`);
  };

  if (!product) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >

        <div
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">
            Loading Product Profiles...
          </span>
        </div>

      </div>
    );
  }

  // SAFE EXTRACTOR: Resolves either .name or .categoryName from your backend object mapping

  const categoryLabel = product.category
    ? (
        product.category.categoryName ||
        product.category.name ||
        String(product.category)
      )
    : "Uncategorized";

  return (

    <div className="container py-5">

      <div className="row g-5 align-items-center shadow-sm rounded bg-white p-4">

        {/* Left Graphics Column */}

        <div className="col-12 col-md-6 text-center">

          {imageUrl ? (

            <img
              className="img-fluid rounded shadow-sm target-display-image"
              src={imageUrl}
              alt={product.imageName || product.name}
              style={{
                maxHeight: "450px",
                objectFit: "contain",
              }}
            />

          ) : (

            <div
              className="bg-light rounded d-flex align-items-center justify-content-center shadow-inner"
              style={{ height: "350px" }}
            >

              <i className="bi bi-image text-muted display-1"></i>

            </div>
          )}

        </div>

        {/* Right Content Column */}

        <div className="col-12 col-md-6">

          <div className="product-description mb-4">

            <span className="badge bg-secondary text-uppercase mb-2 tracking-wider px-3 py-2 text-xs">
              {categoryLabel}
            </span>

            <h1 className="display-5 fw-bold text-dark mb-1">
              {product.name}
            </h1>

            <h5 className="text-muted fw-normal mb-3">
              by{" "}
              <span className="text-primary fw-medium">
                {product.brand}
              </span>
            </h5>

            <hr className="my-3 text-gray-200" />

            <p className="text-secondary leading-relaxed fs-6">
              {product.description}
            </p>

          </div>

          <div className="product-price-block mb-4 p-3 bg-light rounded-3 d-flex flex-column gap-2">

            <div className="d-flex align-items-baseline gap-3">

              <span className="fs-2 fw-bold text-success">
                ${Number(product.price).toFixed(2)}
              </span>

              {product.productAvailable ? (

                <span className="text-success text-sm fw-medium d-flex align-items-center gap-1">

                  <i className="bi bi-check-circle-fill"></i>

                  In Stock

                </span>

              ) : (

                <span className="text-danger text-sm fw-medium d-flex align-items-center gap-1">

                  <i className="bi bi-x-circle-fill"></i>

                  Out of Stock

                </span>
              )}

            </div>

            <div className="text-muted text-sm">

              Available Inventory Units:{" "}

              <span className="fw-bold text-dark">
                {product.stockQuantity}
              </span>

            </div>

            {product.releaseDate && (

              <small className="text-muted mt-1">
                Catalog Listing Date:{" "}
                {new Date(
                  product.releaseDate
                ).toLocaleDateString()}
              </small>

            )}

          </div>

          {/* User Interactivity Block */}

          <div className="action-buttons-rack d-flex flex-column gap-3">

            <button
              className={`btn btn-lg w-100 fw-bold shadow-sm py-2 text-uppercase d-flex align-items-center justify-content-center gap-2 ${
                product.productAvailable
                  ? "btn-warning text-dark"
                  : "btn-secondary text-white disabled"
              }`}
              onClick={handleAddToCartAction}
              disabled={!product.productAvailable}
            >

              <i className="bi bi-cart-plus-fill"></i>

              {product.productAvailable
                ? "Add to Shopping Cart"
                : "Item Sold Out"}

            </button>

            {/* SECURITY FIX: Administrative modification buttons are explicitly hidden from non-admin accounts */}

            {user?.isAdmin && (

              <div className="admin-controls-wrapper d-flex gap-2 mt-2 pt-3 border-top">

                <button
                  className="btn btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                  type="button"
                  onClick={handleEditClick}
                >

                  <i className="bi bi-pencil-square"></i>

                  Modify Details

                </button>

                <button
                  className="btn btn-outline-danger flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                  type="button"
                  onClick={deleteProduct}
                >

                  <i className="bi bi-trash3-fill"></i>

                  Delete Item

                </button>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Product;