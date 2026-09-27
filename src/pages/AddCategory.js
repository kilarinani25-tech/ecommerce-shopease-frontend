import React, { useState, useContext } from "react";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import AppContext from "../components/Context";

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState("");

  const navigate = useNavigate();

  const { triggerCategoryRefresh } = useContext(AppContext);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      return;
    }

    try {
      await axios.post(
        "/api/categories",
        {
          categoryName: categoryName.trim(),
        }
      );

      alert("New Category registered successfully!");

      if (triggerCategoryRefresh) {
        triggerCategoryRefresh();
      }

      setCategoryName("");

      navigate("/");
    } catch (error) {
      console.error(
        "Failed to add category:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Error adding new storefront category.";

      alert(message);
    }
  };

  return (
    <div className="container py-5">

      <div className="row justify-content-center">

        <div className="col-md-6 card shadow-sm p-4 bg-white rounded">

          <h3 className="mb-4 text-center text-primary fw-bold">
            <i className="bi bi-tags-fill me-2"></i>
            Create New Category
          </h3>

          <form onSubmit={handleCategorySubmit}>

            <div className="mb-4">

              <label className="form-label fw-semibold text-secondary">
                Category Designation Name
              </label>

              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="e.g. Tablets, Smart Watches, Accessories"
                value={categoryName}
                onChange={(e) =>
                  setCategoryName(e.target.value)
                }
                required
              />

            </div>

            <div className="d-flex gap-2">

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-bold text-uppercase"
              >
                Save Category
              </button>

              <button
                type="button"
                className="btn btn-secondary w-50 py-2 fw-bold text-uppercase"
                onClick={() => navigate("/")}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
};

export default AddCategory;