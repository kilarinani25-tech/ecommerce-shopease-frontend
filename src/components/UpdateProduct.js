import React, { useState, useEffect } from "react";

import { useParams, useNavigate } from "react-router-dom";

import axios from "axios";

import "../styling/UpdateProduct.css";

const UpdateProduct = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [image, setImage] = useState(null);

  const [categories, setCategories] = useState([]);

  const [updateProduct, setUpdateProduct] = useState({
    id: null,
    name: "",
    description: "",
    brand: "",
    price: "",
    category: null,
    releaseDate: "",
    productAvailable: false,
    stockQuantity: "",
    rating: 0
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/categories"
        );

        setCategories(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Error fetching categories catalog:",
          error
        );
      }
    };

    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/products/${id}`
        );

        setUpdateProduct(response.data);

        try {
          const imageResponse = await axios.get(
            `http://localhost:8080/api/products/${id}/image`,
            {
              responseType: "blob"
            }
          );

          const imageFile = blobToFile(
            imageResponse.data,
            response.data.imageName
          );

          setImage(imageFile);
        } catch (error) {
          console.error(
            "Image fetch error:",
            error
          );
        }
      } catch (error) {
        console.error(
          "Product fetch error:",
          error
        );
      }
    };

    fetchCategories();
    fetchProduct();
  }, [id]);

  const blobToFile = (blobData, fileName) => {
    return new File(
      [blobData],
      fileName || "image.jpg",
      {
        type: blobData.type
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUpdateProduct({
      ...updateProduct,
      [name]: value
    });
  };

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;

    if (!selectedId) {
      setUpdateProduct({
        ...updateProduct,
        category: null
      });

      return;
    }

    const matchedCategory = categories.find(
      (cat) =>
        String(cat.id) === String(selectedId)
    );

    setUpdateProduct({
      ...updateProduct,
      category: matchedCategory || {
        id: Number(selectedId)
      }
    });
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];

    if (selectedImage) {
      setImage(selectedImage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      if (image) {
        formData.append("imageFile", image);
      }

      const payloadDto = {
        id: Number(id),
        name: updateProduct.name,
        description: updateProduct.description,
        brand: updateProduct.brand,
        price: Number(updateProduct.price),
        releaseDate: updateProduct.releaseDate,
        productAvailable:
          updateProduct.productAvailable,
        stockQuantity: Number(
          updateProduct.stockQuantity
        ),
        rating: Number(updateProduct.rating || 0),

        category: updateProduct.category
          ? {
              id: Number(updateProduct.category.id)
            }
          : null
      };

      formData.append(
        "product",
        new Blob(
          [JSON.stringify(payloadDto)],
          {
            type: "application/json"
          }
        )
      );

      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:8080/api/products/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Product updated successfully!");

      navigate(`/product/${id}`);
    } catch (error) {
      console.error(
        "Payload update execution failed:",
        error.response || error
      );

      alert("Failed to update product.");
    }
  };

  return (
    <div className="update-container">
      <h1 className="update-title">
        Update Product
      </h1>

      <form
        className="update-form"
        onSubmit={handleSubmit}
      >
        {/* Image Section */}

        <div className="image-section">
          <img
            src={
              image
                ? URL.createObjectURL(image)
                : "https://via.placeholder.com/300"
            }
            alt="Product"
            className="preview-image"
          />

          <input
            type="file"
            className="form-control mt-3"
            accept="image/*"
            onChange={handleImageChange}
          />

          <div className="form-check mt-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={
                updateProduct.productAvailable
              }
              onChange={(e) =>
                setUpdateProduct({
                  ...updateProduct,
                  productAvailable:
                    e.target.checked
                })
              }
            />

            <label className="form-check-label">
              Product Available
            </label>
          </div>
        </div>

        {/* Form Input Section */}

        <div className="form-section">
          <div className="form-group">
            <label>Name</label>

            <input
              type="text"
              className="form-control"
              name="name"
              value={
                updateProduct.name || ""
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Brand</label>

            <input
              type="text"
              className="form-control"
              name="brand"
              value={
                updateProduct.brand || ""
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              rows="4"
              className="form-control"
              name="description"
              value={
                updateProduct.description || ""
              }
              onChange={handleChange}
            />
          </div>

          <div className="row">
            <div className="col-md-6">
              <label>Price</label>

              <input
                type="number"
                step="0.01"
                className="form-control"
                name="price"
                value={
                  updateProduct.price || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label>Stock Quantity</label>

              <input
                type="number"
                min="0"
                className="form-control"
                name="stockQuantity"
                value={
                  updateProduct.stockQuantity || ""
                }
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Dynamic Category Dropdown */}

          <div className="form-group mt-3">
            <label>Category</label>

            <select
              className="form-select"
              name="category"
              value={
                updateProduct.category?.id || ""
              }
              onChange={handleCategoryChange}
            >
              <option value="">
                Select Category
              </option>

              {categories.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                >
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mt-3">
            <label>Release Date</label>

            <input
              type="date"
              className="form-control"
              name="releaseDate"
              value={
                updateProduct.releaseDate
                  ? updateProduct.releaseDate.substring(
                      0,
                      10
                    )
                  : ""
              }
              onChange={handleChange}
            />
          </div>

          <div className="update-buttons">
            <button
              type="submit"
              className="btn btn-success"
            >
              Update Product
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                navigate(`/product/${id}`)
              }
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;