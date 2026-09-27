import axios from "axios";

import {
  useState,
  useEffect,
  createContext,
  useCallback,
} from "react";

const AppContext = createContext({
  data: [],
  isError: "",
  cart: [],

  user: null,

  selectedCategory: "",
  setSelectedCategory: () => {},

  addToCart: () => {},
  removeFromCart: () => {},
  updateStockQuantity: () => {},

  refreshData: () => {},
  setProducts: () => {},

  clearCart: () => {},

  login: () => {},
  logout: () => {},

  categoryRefresh: 0,
  triggerCategoryRefresh: () => {},
});

export const AppProvider = ({ children }) => {

  // =========================
  // Products
  // =========================

  const [data, setData] = useState([]);

  const [isError, setIsError] = useState("");

  // =========================
  // Category
  // =========================

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [categoryRefresh, setCategoryRefresh] =
    useState(0);

  const triggerCategoryRefresh = () => {
    setCategoryRefresh((prev) => prev + 1);
  };

  // =========================
  // Authentication
  // =========================

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        localStorage.removeItem("user");
        return null;
      }
    }

    return null;
  });

  // =========================
  // Cart
  // =========================

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("cart")
      ) || [];
    } catch (error) {
      return [];
    }
  });

  const baseUrl =
    import.meta.env.VITE_BASE_URL ||
    "http://localhost:8080";

  // =========================
  // Add to Cart
  // =========================

  const addToCart = (product) => {

    const existingProductIndex =
      cart.findIndex(
        (item) => item.id === product.id
      );

    if (existingProductIndex !== -1) {

      const updatedCart = cart.map(
        (item, index) =>
          index === existingProductIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
      );

      setCart(updatedCart);

    } else {

      // Don't store imageData inside localStorage
      const {
        imageData,
        ...productWithoutImage
      } = product;

      const updatedCart = [
        ...cart,
        {
          ...productWithoutImage,
          quantity: 1,
        },
      ];

      setCart(updatedCart);
    }
  };

  // =========================
  // Remove From Cart
  // =========================

  const removeFromCart = (productId) => {

    const updatedCart = cart.filter(
      (item) => item.id !== productId
    );

    setCart(updatedCart);
  };

  // =========================
  // Update Cart Quantity
  // =========================

  const updateStockQuantity = (
    productId,
    newQuantity
  ) => {

    if (newQuantity <= 0) {

      const updatedCart = cart.filter(
        (item) => item.id !== productId
      );

      setCart(updatedCart);

      return;
    }

    const updatedCart = cart.map(
      (item) =>
        item.id === productId
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
    );

    setCart(updatedCart);
  };

  // =========================
  // Fetch Products
  // =========================

  const refreshData = useCallback(
    async () => {

      try {

        setIsError("");

        const response = await axios.get(
          `${baseUrl}/api/products`
        );

        setData(response.data);

      } catch (error) {

        console.error(
          "Error fetching products:",
          error
        );

        setIsError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch products"
        );
      }
    },
    [baseUrl]
  );

  // =========================
  // Replace Products
  // =========================

  const setProducts = (products) => {
    setData(
      Array.isArray(products)
        ? products
        : []
    );
  };

  // =========================
  // Login
  // =========================

  const login = (token) => {

    if (!token) {
      return;
    }

    localStorage.setItem(
      "token",
      token
    );

    /*
     * Current JWT contains the email as
     * the subject.
     *
     * We decode the payload to get the
     * email and role information if
     * available.
     */

    try {

      const payload = JSON.parse(
        atob(
          token.split(".")[1]
        )
      );

      const email = payload.sub;

      const isAdmin =
        payload.role === "ROLE_ADMIN" ||
        payload.role === "ADMIN" ||
        payload.isAdmin === true;

      const loggedInUser = {
        email,
        isAdmin,
        token,
      };

      setUser(loggedInUser);

      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

    } catch (error) {

      console.error(
        "Unable to decode login token:",
        error
      );

      const loggedInUser = {
        token,
      };

      setUser(loggedInUser);

      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );
    }
  };

  // =========================
  // Logout
  // =========================

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    setCart([]);

    localStorage.removeItem("cart");

    setSelectedCategory("");

    window.location.href = "/login";
  };

  // =========================
  // Initial Product Fetch
  // =========================

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // =========================
  // Keep Cart in LocalStorage
  // =========================

  useEffect(() => {

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

  }, [cart]);

  // =========================
  // Context
  // =========================

  return (
    <AppContext.Provider
      value={{
        data,
        isError,

        cart,

        user,

        selectedCategory,
        setSelectedCategory,

        addToCart,
        removeFromCart,
        updateStockQuantity,

        refreshData,
        setProducts,

        clearCart: () => {
          setCart([]);
          localStorage.removeItem("cart");
        },

        login,
        logout,

        categoryRefresh,
        triggerCategoryRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;