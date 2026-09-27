import React, { useState } from "react";
import axios from "axios";

// Pass down the state updater function from your parent component
const SearchBar = ({ setProducts }) => {
  const [keyword, setKeyword] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    // Avoid searching for empty spaces
    if (!keyword.trim()) return;

    try {
      const response = await axios.get(
        "http://localhost:8080/api/products/search",
        {
          params: {
            keyword: keyword.trim()
          }
        }
      );

      console.log(
        "Search matches retrieved successfully:",
        response.data
      );

      if (setProducts) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error(
        "Search system pipeline broken:",
        error.response || error
      );

      alert("Search request failed. Verify console network traces.");
    }
  };

  return (
    <form className="d-flex" onSubmit={handleSearch}>
      <input
        className="form-control me-2 rounded-pill shadow-sm"
        type="search"
        placeholder="Search product name, brand..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        aria-label="Search"
      />

      <button
        className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm"
        type="submit"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;