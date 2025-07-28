/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useSetAtom } from "jotai";

import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { setLoggedInUser } from "@/store/user";
import { Locations, Roles } from "@/types/user";

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    password: "",
    role: "USER",
    location: "INDIA",
    team: "",
  });
  const setUser = useSetAtom(setLoggedInUser);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required.";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!isLogin) {
      if (!formData.full_name.trim()) {
        errors.full_name = "Full name is required.";
      }

      if (!formData.team.trim()) {
        errors.team = "Team code is required.";
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the highlighted errors.");
      return;
    }

    try {
      const url = isLogin ? "/token" : "/register";
      const res = await axios.post(`http://localhost:8000${url}`, formData);
      console.log("res", res);
      const token = res.data.token.access_token;

      const user = res.data.user;

      Cookies.set("token", token, { expires: 2 });
      toast.success(`${isLogin ? "Login" : "Registration"} successful!`);

      const userData = isLogin ? { ...formData, disabled: false } : user;

      setUser({
        ...user,
        role: Roles[user.role as keyof typeof Roles],
        location: Locations[user.location as keyof typeof Locations],
      });

      router.push(`/${userData.location}/${userData.role}/dashboard`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail || "Something went wrong");
      } else {
        toast.error("Unknown error occurred");
      }
    }
  };

  useEffect(() => {
    const autoLogin = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success("Auto-login successful!");
        const { role, location } = res.data;
        setUser({
          ...res.data,
          role: Roles[res.data.role as keyof typeof Roles],
          location: Locations[res.data.location as keyof typeof Locations],
        });
        router.push(`/${location}/${role}/dashboard`);
      } catch (err: unknown) {
        toast.error("Session expired. Please log in again.");
        Cookies.remove("token");
      }
    };

    autoLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster />
      <div className="bg-white shadow-xl p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {isLogin ? "Login" : "Register"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-500">
          <div>
            <input
              name="username"
              placeholder="Username"
              className={`w-full p-2 border rounded-xl ${
                formErrors.username ? "border-red-500" : ""
              }`}
              value={formData.username}
              onChange={handleChange}
            />
            {formErrors.username && (
              <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>
            )}
          </div>

          {!isLogin && (
            <div>
              <input
                name="full_name"
                placeholder="Full Name"
                className={`w-full p-2 border rounded-xl ${
                  formErrors.full_name ? "border-red-500" : ""
                }`}
                value={formData.full_name}
                onChange={handleChange}
              />
              {formErrors.full_name && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.full_name}
                </p>
              )}
            </div>
          )}

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              className={`w-full p-2 border rounded-xl ${
                formErrors.password ? "border-red-500" : ""
              }`}
              value={formData.password}
              onChange={handleChange}
            />
            {formErrors.password && (
              <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>

          {!isLogin && (
            <>
              <select
                name="role"
                className="w-full p-2 border rounded-xl"
                value={formData.role}
                onChange={handleChange}>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="USER">User</option>
              </select>

              <select
                name="location"
                className="w-full p-2 border rounded-xl"
                value={formData.location}
                onChange={handleChange}>
                <option value="INDIA">India</option>
                <option value="EUROPE">Europe</option>
                <option value="NORTH_AMERICA">North America</option>
              </select>

              <div>
                <input
                  name="team"
                  placeholder="Team Code"
                  className={`w-full p-2 border rounded-xl ${
                    formErrors.team ? "border-red-500" : ""
                  }`}
                  value={formData.team}
                  onChange={handleChange}
                />
                {formErrors.team && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.team}</p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 cursor-pointer">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="text-blue-500 underline cursor-pointer"
            onClick={() => {
              setFormErrors({});
              setIsLogin(!isLogin);
            }}>
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
