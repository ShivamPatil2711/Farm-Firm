import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext"; // adjust path if needed
import { toast } from "react-toastify";

const LoginPage = () => {
  const { setIsLoggedIn, setUser } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "farmer", // default role
  });

  const navigate = useNavigate();
  const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${backendApiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password.trim(),
          userType: formData.userType, // ← sending role to backend
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Logged in successfully");
        setIsLoggedIn(true);
        console.log(data.user);
        setUser(data.user);
        navigate("/");
      } else {
        toast.error(data.error || data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
          alt="Agricultural landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-emerald-700/60 flex items-center justify-center">
          <div className="text-center text-white px-8 max-w-lg">
            <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              Welcome Back to KrishiConnect
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Continue building connections and growing your agricultural business.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-10 justify-center lg:justify-start">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌾</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">KrishiConnect</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center lg:text-left">
            Sign in to your account
          </h1>

          <p className="text-gray-600 mb-8 text-center lg:text-left">
            Don't have an account?{" "}
            <Link to="/register" className="text-emerald-600 hover:underline font-medium">
              Create one
            </Link>
          </p>

          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Login as
            </label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="farmer"
                  checked={formData.userType === "farmer"}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                />
                <span className="ml-3 text-gray-800 font-medium">Farmer</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="firm"
                  checked={formData.userType === "firm"}
                  onChange={handleChange}
                  className="w-5 h-5 text-amber-600 border-gray-300 focus:ring-amber-500"
                />
                <span className="ml-3 text-gray-800 font-medium">Firm / Buyer</span>
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="#" className="text-sm text-emerald-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 font-medium text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-3 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : formData.userType === "farmer"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <span className="text-lg">→</span>}
            </button>
          </form>

          {/* Divider & Register Links */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-500">New to KrishiConnect?</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/register?role=farmer"
              className="block py-3.5 px-6 text-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
            >
              Join as Farmer
            </Link>
            <Link
              to="/register?role=firm"
              className="block py-3.5 px-6 text-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
            >
              Join as Firm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;