import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { UserPlus, Users, Sparkles, MapPin, CheckCircle, Leaf } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

export default function SuggestedFarmers() {
  const { user } = useContext(AuthContext);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState(new Set());

  useEffect(() => {
    if (user?._id && user?.userType === "farmer") {
      fetch(`${BACKEND_URL}/api/suggest-farmers`, {
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

  const handleSendRequest = async (farmerId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/friend-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          senderId: user._id,
          receiverId: farmerId,
          senderType: "farmer",
          receiverType: "farmer"
        })
      });
      
      if (res.ok) {
        setSentRequests(prev => new Set(prev).add(farmerId));
      }
    } catch (err) {
      console.error("Failed to send request", err);
    }
  };

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />;
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-border">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-green-500" />
        Suggested Farmer Peers
      </h3>

      <div className="space-y-4">
        {suggestions.map((peer) => (
          <div key={peer._id} className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl border border-green-100">
            
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Users className="w-5 h-5" />
              </div>
              
              <div>
                <p className="font-semibold text-gray-800">{peer.FirstName} {peer.LastName}</p>
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {peer.isSameCity === 30 && (
                     <span className="text-xs text-green-700 font-medium flex items-center gap-1"><MapPin className="w-3 h-3"/> Same City</span>
                  )}
                  {peer.isSameState === 15 && peer.isSameCity === 0 && (
                     <span className="text-xs text-green-700 font-medium flex items-center gap-1"><MapPin className="w-3 h-3"/> Same State</span>
                  )}
                  {peer.sharedCropsCount > 0 && (
                     <span className="text-xs text-green-700 font-medium flex items-center gap-1"><Leaf className="w-3 h-3"/> Grows similar crops</span>
                  )}
                  {peer.mutualFriendsCount > 0 && (
                     <span className="text-xs text-green-700 font-medium flex items-center gap-1">• {peer.mutualFriendsCount} mutual friend(s)</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSendRequest(peer._id)}
              disabled={sentRequests.has(peer._id)}
              className={`p-2 rounded-full transition-colors ${
                sentRequests.has(peer._id) 
                  ? "bg-green-100 text-green-600" 
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {sentRequests.has(peer._id) ? <CheckCircle className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </button>
            
          </div>
        ))}
      </div>
    </div>
  );
}

