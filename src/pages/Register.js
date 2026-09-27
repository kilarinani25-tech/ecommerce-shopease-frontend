import { useState } from "react";
import axios from "axios";

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    let tempErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!user.name.trim()) {
      tempErrors.name = "Name is required";
    } else if (user.name.trim().length < 3) {
      tempErrors.name = "Name must be at least 3 characters";
    }

    if (!user.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(user.email.trim())) {
      tempErrors.email = "Enter a valid email";
    }

    if (!user.phone.trim()) {
      tempErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(user.phone.trim())) {
      tempErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!user.password) {
      tempErrors.password = "Password is required";
    } else if (user.password.length < 8) {
      tempErrors.password = "Minimum 8 characters required";
    }

    if (!user.confirmPassword) {
      tempErrors.confirmPassword = "Please confirm your password";
    } else if (user.password !== user.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(tempErrors);

    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await axios.post(
        "http://localhost:8080/api/users/register",
        {
          name: user.name.trim(),
          email: user.email.trim(),
          phone: user.phone.trim(),
          password: user.password,
        }
      );

      alert("Registration Successful! Please login.");

      setUser({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setErrors({});
    } catch (error) {
      console.error(
        "Registration Error:",
        error.response?.data || error.message
      );

      let errorMessage = "Registration failed.";

      if (
        error.response?.data &&
        typeof error.response.data === "object"
      ) {
        const values = Object.values(error.response.data);

        errorMessage =
          values.length > 0
            ? values[0]
            : "Invalid input data.";
      } else if (typeof error.response?.data === "string") {
        errorMessage = error.response.data;
      }

      alert(errorMessage);
    }
  };

  return (
    <div className="container mt-5">
      <div
        className="card p-4 mx-auto"
        style={{ maxWidth: "500px" }}
      >
        <h2 className="text-center mb-4">Register</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="form-control mb-2"
            value={user.name}
            onChange={handleChange}
          />

          <small className="text-danger">
            {errors.name}
          </small>

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="form-control mb-2"
            value={user.email}
            onChange={handleChange}
          />

          <small className="text-danger">
            {errors.email}
          </small>

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            className="form-control mb-2"
            value={user.phone}
            onChange={handleChange}
          />

          <small className="text-danger">
            {errors.phone}
          </small>

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="form-control mb-2"
            value={user.password}
            onChange={handleChange}
          />

          <small className="text-danger">
            {errors.password}
          </small>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="form-control mb-2"
            value={user.confirmPassword}
            onChange={handleChange}
          />

          <small className="text-danger">
            {errors.confirmPassword}
          </small>

          <button
            className="btn btn-primary w-100 mt-3"
            type="submit"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;