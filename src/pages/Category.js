import React, {
  useContext,
} from "react";

import AppContext from "../components/Context";

const Category = () => {
  const {
    data,
    selectedCategory,
    setSelectedCategory,
  } = useContext(AppContext);

  const uniqueCategories =
    data && data.length > 0
      ? [
          "",
          ...new Set(
            data
              .map(
                (product) =>
                  product.category?.categoryName
              )
              .filter(Boolean)
          ),
        ]
      : [""];

  return (
    <div className="category-container">

      <select
        className="category-select"
        value={selectedCategory}
        onChange={(e) =>
          setSelectedCategory(
            e.target.value
          )
        }
      >

        <option value="">
          Categories
        </option>

        {uniqueCategories.map(
          (category) => {
            if (!category) return null;

            return (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            );
          }
        )}

      </select>

    </div>
  );
};

export default Category;