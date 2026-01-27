import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "farmer";

  const [role, setRole] = useState(initialRole === "firm" ? "firm" : "farmer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const [formData, setFormData] = useState({
    // Common fields
    email: "",
    password: "",
    phoneNumber: "",
    city: "",
    state: "",
    // Farmer-specific
    firstName: "",
    lastName: "",
    // Firm-specific
    companyName: "",
    contactPerson: "",
  });

  const navigate = useNavigate();
  const backendApiUrl =  "http://localhost:4003";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages([]);
    setLoading(true);

    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        userType: role,
      };

      if (role === "farmer") {
        payload.FirstName = formData.firstName.trim();
        payload.LastName  = formData.lastName.trim();
      } else if (role === "firm") {
        payload.CompanyName   = formData.companyName.trim();
        payload.ContactPerson = formData.contactPerson.trim();
      }
console.log("Signup payload:", payload);
      const response = await fetch(`${backendApiUrl}/api/signup/${role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
console.log("Signup response data:", data);
      if (!response.ok) {
        const errors = data.errors || data.errorMessages || [data.message || "Registration failed"];
        setErrorMessages(Array.isArray(errors) ? errors : [errors]);
        toast.error("Please correct the errors shown above.");
        return;
      }

      toast.success(data.message || "Account created successfully!");
      navigate(data.redirect || "/login-page");

    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Unable to connect to the server. Please try again later.");
      setErrorMessages(["Network or server error occurred."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-10 justify-center lg:justify-start">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-3xl">🌾</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">KrishiConnect</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center lg:text-left">
            Create your account
          </h1>

          <p className="text-gray-600 mb-8 text-center lg:text-left">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-5 mb-10">
            <button
              type="button"
              onClick={() => setRole("farmer")}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center ${
                role === "farmer"
                  ? "border-emerald-600 bg-emerald-50 shadow-md"
                  : "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40"
              }`}
            >
              <span className="text-5xl mb-4">👨‍🌾</span>
              <p className={`font-bold text-xl ${role === "farmer" ? "text-emerald-700" : "text-gray-800"}`}>
                Farmer
              </p>
              <p className="text-sm text-gray-600 mt-1">Sell your produce directly</p>
            </button>

            <button
              type="button"
              onClick={() => setRole("firm")}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center ${
                role === "firm"
                  ? "border-amber-600 bg-amber-50 shadow-md"
                  : "border-gray-200 hover:border-amber-400 hover:bg-amber-50/40"
              }`}
            >
              <span className="text-5xl mb-4">🏢</span>
              <p className={`font-bold text-xl ${role === "firm" ? "text-amber-700" : "text-gray-800"}`}>
                Firm / Buyer
              </p>
              <p className="text-sm text-gray-600 mt-1">Source crops from farmers</p>
            </button>
          </div>

          {/* Error Display */}
          {errorMessages.length > 0 && (
            <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-xl text-red-800">
              <p className="font-medium mb-3">Please correct the following:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-sm">
                {errorMessages.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role-specific fields */}
            {role === "firm" ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="e.g., Green Agro Traders"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contactPerson"
                    name="contactPerson"
                    type="text"
                    placeholder="e.g., Rahul Sharma"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="e.g., Shivam"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="e.g., Patel"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City / District <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="e.g., Bhopal"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="e.g., Madhya Pradesh"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 text-2xl"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-8 font-semibold text-lg text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-3 ${
                role === "farmer"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-amber-600 hover:bg-amber-700"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <span className="text-xl">→</span>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-8">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="text-emerald-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-emerald-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      {/* Visual Side */}
      <div
        className={`hidden lg:flex flex-1 items-center justify-center transition-colors duration-500 ${
          role === "farmer" ? "bg-emerald-700" : "bg-amber-700"
        }`}
      >
        <div className="text-center text-white px-12 max-w-xl">
          {role === "farmer" ? (
            <>
              <div className="text-9xl mb-10">👨‍🌾</div>
              <h2 className="text-5xl font-bold mb-8">Sell Directly. Earn Fairly.</h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Connect directly with buyers across India — no middlemen, better prices, full control.
              </p>
            </>
          ) : (
            <>
              <div className="text-9xl mb-10">🏢</div>
              <h2 className="text-5xl font-bold mb-8">Source Smart. Grow Strong.</h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Access verified farmers, real-time prices, and build reliable supply chains.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;