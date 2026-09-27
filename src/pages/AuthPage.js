import React, { useState, useContext } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import axios from "axios";

import AppContext from "../components/Context";

const AuthPage = () => {
  const { login } = useContext(AppContext);

  const navigate = useNavigate();

  const location = useLocation();

  const [isLoginMode, setIsLoginMode] = useState(true);

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    let localErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!formData.email.trim()) {
      localErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      localErrors.email = "Please enter a valid email format.";
    }

    if (!formData.password) {
      localErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      localErrors.password =
        "Password must contain at least 8 characters.";
    }

    if (!isLoginMode) {
      if (!formData.name.trim()) {
        localErrors.name = "Name is required.";
      } else if (formData.name.trim().length < 3) {
        localErrors.name =
          "Name must be at least 3 characters long.";
      }

      if (!formData.phone.trim()) {
        localErrors.phone = "Phone number is required.";
      } else if (!phoneRegex.test(formData.phone.trim())) {
        localErrors.phone =
          "Enter a valid 10-digit mobile number starting with 6-9.";
      }
    }

    setErrors(localErrors);

    return Object.keys(localErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (!isLoginMode) {
        // REGISTER

        await axios.post(
          "http://localhost:8080/api/users/register",
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            password: formData.password,
          }
        );

        alert("Registration successful! Please login.");

        setIsLoginMode(true);

        setFormData({
          name: "",
          email: formData.email,
          password: "",
          phone: "",
        });

        setErrors({});
      } else {
        // LOGIN

        const response = await axios.post(
          "http://localhost:8080/api/users/login",
          {
            email: formData.email.trim(),
            password: formData.password,
          }
        );

        /*
         * Backend response:
         *
         * {
         *   "token": "JWT_TOKEN"
         * }
         */

        const token = response.data?.token;

        if (!token) {
          alert("Login failed. Token was not received.");
          return;
        }

        // Store JWT and update Context
        login(token);

        navigate(from, {
          replace: true,
        });
      }
    } catch (error) {
      console.error(
        "Authentication Error:",
        error.response?.data || error.message
      );

      let serverMessage = "Something went wrong.";

      if (error.response?.data?.message) {
        serverMessage = error.response.data.message;
      } else if (
        typeof error.response?.data === "string"
      ) {
        serverMessage = error.response.data;
      } else if (error.response?.status === 401) {
        serverMessage = "Invalid email or password.";
      }

      alert(serverMessage);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <div
        className="card p-4 shadow-lg border-0"
        style={{
          width: "100%",
          maxWidth: "440px",
          borderRadius: "12px",
        }}
      >
        <h3 className="text-center fw-bold mb-3">
          {isLoginMode ? "Sign In" : "Create Account"}
        </h3>

        <form onSubmit={handleSubmit} noValidate>

          {!isLoginMode && (
            <>
              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  className={`form-control ${
                    errors.name ? "is-invalid" : ""
                  }`}
                  value={formData.name}
                  onChange={handleChange}
                />

                {errors.name && (
                  <div className="invalid-feedback">
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Phone Number
                </label>

                <input
                  type="text"
                  name="phone"
                  className={`form-control ${
                    errors.phone ? "is-invalid" : ""
                  }`}
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />

                {errors.phone && (
                  <div className="invalid-feedback">
                    {errors.phone}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="mb-3">
            <label className="form-label small fw-semibold">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              className={`form-control ${
                errors.email ? "is-invalid" : ""
              }`}
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
            />

            {errors.email && (
              <div className="invalid-feedback">
                {errors.email}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">
              Password
            </label>

            <input
              type="password"
              name="password"
              className={`form-control ${
                errors.password ? "is-invalid" : ""
              }`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />

            {errors.password && (
              <div className="invalid-feedback">
                {errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold mb-3"
          >
            {isLoginMode
              ? "Sign In"
              : "Register Profile"}
          </button>
        </form>

        <div className="text-center">
          <button
            className="btn btn-link btn-sm text-decoration-none fw-medium"
            onClick={() => {
              setIsLoginMode(!isLoginMode);

              setErrors({});

              setFormData({
                name: "",
                email: "",
                password: "",
                phone: "",
              });
            }}
          >
            {isLoginMode
              ? "Don't have an account? Sign up here"
              : "Already registered? Sign in here"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;