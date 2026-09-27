import React, { useContext, useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";

import axios from "axios";

import AppContext from "./Context";

import "../styling/ProductCard.css";

const ProductCard = ({ product }) => {
  const { addToCart, cart, user } = useContext(AppContext);

  const [imageUrl, setImageUrl] = useState("");

  const navigate = useNavigate();

  const {
    id,
    name,
    brand,
    price,
    stockQuantity,
    productImageName,
    rating
  } = product;

  const productRatingScore = rating || 4;

  // Use the user from context to determine login status
  const isLoggedIn = !!user;

  useEffect(() => {
    const fetchCardImage = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/products/${id}/image`,
          {
            responseType: "blob"
          }
        );

        const imageObjectUrl = URL.createObjectURL(response.data);
        setImageUrl(imageObjectUrl);

        return () => URL.revokeObjectURL(imageObjectUrl);
      } catch (err) {
        console.error(
          `Unable to resolve image blob for product ID: ${id}`,
          err
        );
      }
    };

    if (id) {
      fetchCardImage();
    }
  }, [id]);

  const cartItem = cart?.find((item) => item.id === id);

  const currentQuantityInCart = cartItem
    ? cartItem.quantity
    : 0;

  const isOutOfStock = stockQuantity <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      alert("Please sign in to add items to your cart.");

      navigate("/login", {
        state: {
          from: window.location.pathname
        }
      });

      return;
    }

    addToCart(product);
  };

  const renderStars = (score) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi ${
            i <= score
              ? "bi-star-fill text-warning"
              : "bi-star text-muted"
          } me-1`}
        ></i>
      );
    }

    return stars;
  };

  return (
    <div
      className={`store-product-card ${
        isOutOfStock ? "out-of-stock-card" : ""
      }`}
    >
      <Link
        to={`/product/${id}`}
        className="card-clickable-area"
      >
        <div className="card-image-wrapper">
          <img
            src={
              imageUrl ||
              "https://placehold.co/300x240?text=No+Image+Available"
            }
            alt={name}
            className="product-card-img"
          />

          {isOutOfStock && (
            <div className="out-of-stock-overlay">
              <span>Sold Out</span>
            </div>
          )}
        </div>

        <div className="card-info-body">
          <span className="product-brand-tag">
            {brand || "Generic"}
          </span>

          <h3
            className="product-title-text"
            title={name}
          >
            {name}
          </h3>

          <div className="product-rating-stars-container mb-2 small">
            {renderStars(productRatingScore)}

            <span className="text-muted ms-1 small">
              ({productRatingScore}.0)
            </span>
          </div>

          <div className="card-pricing-row">
            <span className="product-price-display">
              ${Number(price).toFixed(2)}
            </span>

            <span
              className={`stock-indicator-pill ${
                isOutOfStock
                  ? "text-danger"
                  : "text-success"
              }`}
            >
              {isOutOfStock
                ? "Out of stock"
                : `${stockQuantity} left`}
            </span>
          </div>
        </div>
      </Link>

      <div className="card-action-footer">
        <button
          className={`add-to-cart-action-btn ${
            isOutOfStock ? "btn-disabled" : ""
          }`}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock
            ? "Unavailable"
            : currentQuantityInCart > 0
            ? `Added (${currentQuantityInCart})`
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;