import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Minus, Flame, RefreshCw
} from "lucide-react";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

export default function DemandInsights({ userState }) {
  const [hotCrops, setHotCrops] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchHotCrops = () => {
    setLoading(true);
    setError(null);

    const url = userState
      ? `${BACKEND_URL}/api/ml/demand/hot-crops?state=${encodeURIComponent(userState)}`
      : `${BACKEND_URL}/api/ml/demand/hot-crops`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load forecast");
        return r.json();
      })
      .then(setHotCrops)
      .catch(() => setError("Forecast unavailable right now."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHotCrops(); }, [userState]);

  // ── Helpers ─────────────────────────────────────────────
  const TrendIcon = ({ trend }) => {
    if (trend === "rising")  return <TrendingUp   className="w-4 h-4 text-green-500" />;
    if (trend === "falling") return <TrendingDown  className="w-4 h-4 text-red-500"   />;
    return                          <Minus         className="w-4 h-4 text-yellow-500" />;
  };

  const trendColor = (trend) =>
    trend === "rising"  ? "text-green-600" :
    trend === "falling" ? "text-red-600"   : "text-yellow-600";

  const trendBg = (trend) =>
    trend === "rising"  ? "bg-green-50  border-green-200" :
    trend === "falling" ? "bg-red-50    border-red-200"   :
                          "bg-yellow-50 border-yellow-200";

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 h-full border border-border">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Demand Forecast — Next 30 Days
        </h3>
        <button
          onClick={fetchHotCrops}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i}
              className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 text-center py-4">{error}</p>
      )}

      {/* Hot Crops List */}
      {!loading && !error && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {hotCrops.map((crop, idx) => (
            <div
              key={crop.crop_name}
              className={`flex items-center justify-between p-3 rounded-xl border ${trendBg(crop.trend)}`}
            >
              {/* Left — rank + crop info */}
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-gray-400 w-5">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-800">
                    {crop.crop_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Confidence: {crop.confidence}% •{" "}
                    Next wk: ~{crop.next_week_demand}q
                  </p>
                </div>
              </div>

              {/* Right — trend arrow + percent */}
              <div className="flex items-center gap-1.5">
                <TrendIcon trend={crop.trend} />
                <span className={`font-bold text-sm ${trendColor(crop.trend)}`}>
                  {crop.trend_percent > 0 ? "+" : ""}
                  {crop.trend_percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 text-center">
        Based on firm request patterns &amp; seasonal data on KrishiConnect.
      </p>
    </div>
  );
}

