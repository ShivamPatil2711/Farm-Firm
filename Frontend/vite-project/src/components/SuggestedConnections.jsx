import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { UserPlus, Building2, Sparkles, MapPin, CheckCircle, Star } from "lucide-react";
import FirmReviewsModal from "./FirmReviewsModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

export default function SuggestedConnections() {
  const { user } = useContext(AuthContext);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [reviewsFirm, setReviewsFirm] = useState(null);

  useEffect(() => {
    if (user?._id && user?.userType === "farmer") {
      fetch(`${BACKEND_URL}/api/suggest-firms`, {
        method: "GET",
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSuggestions(data.suggestions);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSendRequest = async (firmId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/friend-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          senderId: user._id,
          receiverId: firmId,
          senderType: "farmer",
          receiverType: "firm"
        })
      });
      
      if (res.ok) {
        setSentRequests(prev => new Set(prev).add(firmId));
      }
    } catch (err) {
      console.error("Failed to send request", err);
    }
  };

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />;
  if (suggestions.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md p-6 border border-border">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-500" />
        Suggested Buyers For You
      </h3>

      <div className="space-y-4">
        {suggestions.map((firm) => (
          <div key={firm._id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              
              <div>
                <p className="font-semibold text-gray-800">{firm.CompanyName || "Unknown Firm"}</p>
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {firm.isSameCity === 30 && (
                     <span className="text-xs text-blue-600 font-medium flex items-center gap-1"><MapPin className="w-3 h-3"/> Same City</span>
                  )}
                  {firm.isSameState === 15 && firm.isSameCity === 0 && (
                     <span className="text-xs text-blue-600 font-medium flex items-center gap-1"><MapPin className="w-3 h-3"/> Same State</span>
                  )}
                  {firm.mutualFriendsCount > 0 && (
                     <span className="text-xs text-blue-600 font-medium flex items-center gap-1">• {firm.mutualFriendsCount} mutual friend(s)</span>
                  )}
                  {firm.reviewCount > 0 && (
                    <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> {firm.averageRating.toFixed(1)}/5 from {firm.reviewCount} farmer review{firm.reviewCount === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => setReviewsFirm(firm)}
                className="whitespace-nowrap text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline"
              >
                View reviews
              </button>
              <button
                type="button"
                onClick={() => handleSendRequest(firm._id)}
                disabled={sentRequests.has(firm._id)}
                className={`p-2 rounded-full transition-colors ${
                  sentRequests.has(firm._id) 
                    ? "bg-green-100 text-green-600" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                aria-label={sentRequests.has(firm._id) ? "Request sent" : `Connect with ${firm.CompanyName || "firm"}`}
              >
                {sentRequests.has(firm._id) ? <CheckCircle className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              </button>
            </div>
            
          </div>
        ))}
      </div>
      </div>
      {reviewsFirm && (
        <FirmReviewsModal
          firm={reviewsFirm}
          onClose={() => setReviewsFirm(null)}
        />
      )}
    </>
  );
}

