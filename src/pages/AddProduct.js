import React, { useState, useEffect } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [categories, setCategories] = useState([]);

  const [image, setImage] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const [validated, setValidated] = useState(false);

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "/api/categories"
        );

        setCategories(response.data);

      } catch (error) {
        console.error(
          "Error fetching categories:",
          error
        );

        toast.error("Unable to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    const fieldValue =
      type === "checkbox"
        ? checked
        : value;

    setProduct((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    setImage(file);

    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/png",
      ];

      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image:
            "Please select a valid image file (JPEG or PNG)",
        }));

        setImagePreview(null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image:
            "Image size should be less than 5MB",
        }));

        setImagePreview(null);
        return;
      }

      setErrors((prev) => ({
        ...prev,
        image: null,
      }));

      const reader = new FileReader();

      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };

      reader.readAsDataURL(file);

    } else {
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!product.name.trim()) {
      newErrors.name =
        "Product name is required";
    }

    if (!product.brand.trim()) {
      newErrors.brand =
        "Brand is required";
    }

    if (!product.description.trim()) {
      newErrors.description =
        "Description is required";
    }

    if (
      !product.price ||
      parseFloat(product.price) <= 0
    ) {
      newErrors.price =
        "Price must be greater than zero";
    }

    if (!product.category) {
      newErrors.category =
        "Please select a category";
    }

    if (
      product.stockQuantity === "" ||
      parseInt(product.stockQuantity) < 0
    ) {
      newErrors.stockQuantity =
        "Stock quantity cannot be negative";
    }

    if (!product.releaseDate) {
      newErrors.releaseDate =
        "Release date is required";
    }

    if (!image) {
      newErrors.image =
        "Product image is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    setValidated(true);

    if (
      !validateForm() ||
      !form.checkValidity()
    ) {
      event.stopPropagation();
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append(
        "imageFile",
        image
      );

      /*
       * Backend Product expects a Category object.
       * We selected the category ID from the dropdown.
       */
      const selectedCategory = categories.find(
        (category) =>
          String(category.id) ===
          String(product.category)
      );

      if (!selectedCategory) {
        setErrors({
          category:
            "Selected category was not found",
        });

        setLoading(false);
        return;
      }

      const productData = {
        name: product.name.trim(),
        brand: product.brand.trim(),
        description: product.description.trim(),
        price: parseFloat(product.price),
        category: selectedCategory,
        stockQuantity: parseInt(
          product.stockQuantity
        ),
        releaseDate: product.releaseDate,
        productAvailable:
          product.productAvailable,
      };

      formData.append(
        "product",
        new Blob(
          [JSON.stringify(productData)],
          {
            type: "application/json",
          }
        )
      );

      await axios.post(
        "/api/products",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      toast.success(
        "Product added successfully"
      );

      setProduct({
        name: "",
        brand: "",
        description: "",
        price: "",
        category: "",
        stockQuantity: "",
        releaseDate: "",
        productAvailable: false,
      });

      setImage(null);

      setImagePreview(null);

      setValidated(false);

      setErrors({});

      navigate("/");

    } catch (error) {
      console.error(
        "Error adding product:",
        error.response?.data ||
          error.message
      );

      if (
        error.response?.data &&
        typeof error.response.data ===
          "object"
      ) {
        setErrors(
          error.response.data
        );
      } else {
        toast.error(
          "Error adding product"
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 pt-4">

      <form
        noValidate
        onSubmit={submitHandler}
        className="row g-4"
      >

        <div className="col-md-6">

          <label>Name</label>

          <input
            type="text"
            name="name"
            className="form-control"
            value={product.name}
            onChange={handleInputChange}
          />

          {errors.name && (
            <div className="text-danger">
              {errors.name}
            </div>
          )}

        </div>

        <div className="col-md-6">

          <label>Brand</label>

          <input
            type="text"
            name="brand"
            className="form-control"
            value={product.brand}
            onChange={handleInputChange}
          />

          {errors.brand && (
            <div className="text-danger">
              {errors.brand}
            </div>
          )}

        </div>

        <div className="col-md-12">

          <label>Description</label>

          <textarea
            name="description"
            className="form-control"
            value={product.description}
            onChange={handleInputChange}
          />

          {errors.description && (
            <div className="text-danger">
              {errors.description}
            </div>
          )}

        </div>

        <div className="col-md-4">

          <label>Price</label>

          <input
            type="number"
            name="price"
            className="form-control"
            value={product.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
          />

          {errors.price && (
            <div className="text-danger">
              {errors.price}
            </div>
          )}

        </div>

        <div className="col-md-4">

          <label>Category</label>

          <select
            className="form-select"
            value={product.category}
            onChange={handleInputChange}
            name="category"
            id="category"
          >

            <option value="">
              Select category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.categoryName}
                </option>
              )
            )}

          </select>

          {errors.category && (
            <div className="text-danger">
              {errors.category}
            </div>
          )}

        </div>

        <div className="col-md-4">

          <label>
            Stock Quantity
          </label>

          <input
            type="number"
            name="stockQuantity"
            className="form-control"
            value={product.stockQuantity}
            onChange={handleInputChange}
            min="0"
          />

          {errors.stockQuantity && (
            <div className="text-danger">
              {errors.stockQuantity}
            </div>
          )}

        </div>

        <div className="col-md-6">

          <label>
            Release Date
          </label>

          <input
            type="date"
            name="releaseDate"
            className="form-control"
            value={product.releaseDate}
            onChange={handleInputChange}
          />

          {errors.releaseDate && (
            <div className="text-danger">
              {errors.releaseDate}
            </div>
          )}

        </div>

        <div className="col-md-6 d-flex align-items-center">

          <div className="form-check">

            <input
              className="form-check-input"
              type="checkbox"
              name="productAvailable"
              checked={
                product.productAvailable
              }
              onChange={handleInputChange}
            />

            <label className="form-check-label">
              Product Available
            </label>

          </div>

        </div>

        <div className="col-md-12">

          <label>Image</label>

          <input
            type="file"
            className="form-control"
            accept="image/jpeg,image/png"
            onChange={handleImageChange}
          />

          {errors.image && (
            <div className="text-danger">
              {errors.image}
            </div>
          )}

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: "150px",
                marginTop: "10px",
              }}
            />
          )}

        </div>

        <div className="col-12 text-center">

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? "Adding..."
              : "Add Product"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default AddProduct;