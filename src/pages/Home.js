import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import axios from "axios";

import AppContext from "../components/Context";

import "../styling/Home.css";

const Home = () => {
  const {
    data,
    isError,
    addToCart,
    refreshData,
    selectedCategory,
  } = useContext(AppContext);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (data && data.length > 0) {
      const fetchImages = async () => {
        const updatedProducts = await Promise.all(
          data.map(async (product) => {
            try {
              const response = await axios.get(
                `/api/products/${product.id}/image`,
                {
                  responseType: "blob",
                }
              );

              const imageUrl = URL.createObjectURL(
                response.data
              );

              return {
                ...product,
                imageUrl,
              };
            } catch (error) {
              console.error(
                `Error loading image for product ${product.id}:`,
                error
              );

              return {
                ...product,
                imageUrl:
                  "https://via.placeholder.com/300",
              };
            }
          })
        );

        setProducts(updatedProducts);
      };

      fetchImages();
    } else {
      setProducts([]);
    }
  }, [data]);

  // Filter products based on selected category
  const filteredProducts = selectedCategory
    ? products.filter(
        (product) =>
          product.category?.categoryName?.toLowerCase() ===
          selectedCategory.toLowerCase()
      )
    : products;

  if (isError) {
    return (
      <h2
        style={{
          textAlign: "center",
          marginTop: "150px",
        }}
      >
        Something Went Wrong...
      </h2>
    );
  }

  return (
    <div className="home-container">

      {/* Hero Section */}

      <div className="hero-section">

        <div className="hero-content">

          <h1>Welcome To ShopEase</h1>

          <p>
            Discover amazing products at the best prices.
            Shop laptops, mobiles, fashion, electronics
            and much more.
          </p>

          <a href="#products" className="shop-btn">
            Shop Now
          </a>

        </div>

      </div>

      {/* Dynamic Title Header matching the active category selection */}

      <h2 id="products" className="home-title">
        {selectedCategory
          ? `${selectedCategory.charAt(0).toUpperCase() +
              selectedCategory.slice(1)} Products`
          : "Featured Products"}
      </h2>

      <div className="grid">

        {filteredProducts.length === 0 ? (

          <h2>No Products Available</h2>

        ) : (

          filteredProducts.map((product) => (

            <div
              className={`product-card ${
                !product.productAvailable
                  ? "out-of-stock"
                  : ""
              }`}
              key={product.id}
            >

              <Link
                to={`/product/${product.id}`}
                className="product-link"
              >

                <div className="image-container">

                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-image"
                  />

                  <div className="wishlist-btn">
                    <i className="bi bi-heart"></i>
                  </div>

                </div>

                <div className="card-body">

                  <h5 className="product-name">
                    {product.name}
                  </h5>

                  <p className="product-brand">
                    {product.brand}
                  </p>

                  <h4 className="product-price">
                    ₹{Number(product.price).toFixed(2)}
                  </h4>

                  <button
                    className="cart-btn"
                    disabled={!product.productAvailable}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      addToCart(product);
                    }}
                  >
                    {product.productAvailable
                      ? "Add To Cart"
                      : "Out Of Stock"}
                  </button>

                </div>

              </Link>

            </div>

          ))
        )}

      </div>

    </div>
  );
};

export default Home;