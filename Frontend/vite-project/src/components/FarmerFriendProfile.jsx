// src/pages/FarmerFriendProfile.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from './Badge';
import { Button } from "./Button";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import {
  User,
  MapPin,
  Package,
  ShoppingBag,
  Loader2,
  UserPlus,
  AlertCircle
} from "lucide-react";

import { AuthContext } from "./AuthContext";   

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

const FarmerFriendProfile = ({ id }) => {
  const farmerId = id; // receiverId
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);   // expected: { _id, userType, ... }

  const [farmer, setFarmer] = useState(null);
  const [listedCrops, setListedCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Friend request states
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);     // null | 'sent' | 'error'
  const [requestErrorMessage, setRequestErrorMessage] = useState(""); // exact backend message

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchPublicFarmerData = async () => {
      try {
        setLoading(true);
        setError(null);
        const profileRes = await fetch(
          `${BACKEND_URL}/api/friend-profile/${farmerId}?userType=farmer`,
          { method: "GET" }
        );
        if (!profileRes.ok) {
          throw new Error("Failed to load farmer profile");
        }
        const profileData = await profileRes.json();
        console.log("Fetched farmer profile data:", profileData);
        setFarmer(profileData.profile);
        setListedCrops(profileData.profile.listedCrops || []);
      } catch (err) {
        console.error("Error loading public farmer profile:", err);
        setError(err.message || "Could not load farmer information");
      } finally {
        setLoading(false);
      }
    };

    if (farmerId) {
      fetchPublicFarmerData();
    }
  }, [farmerId]);

  const totalSales = farmer?.completedSalesCount || 0;

  const handleAddFriend = async () => {
    if (!user?._id || !farmerId) {
      setRequestStatus("error");
      setRequestErrorMessage("Authentication required. Please log in.");
      return;
    }

    setIsRequesting(true);
    setRequestStatus(null);
    setRequestErrorMessage("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/friend-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${user.token}`, // ← uncomment if needed
        },
        body: JSON.stringify({
          senderId: user._id,
          receiverId: farmerId,
          senderType: user.userType,
          receiverType: "farmer",
        }),
      });

      const data = await response.json();
      console.log("Friend request response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to send friend request");
      }

      setRequestStatus("sent");
    } catch (err) {
      console.error("Error sending friend request:", err);
      setRequestStatus("error");
      setRequestErrorMessage(err.message);
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-gray-600">Loading farmer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="pt-10 pb-8">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Farmer not found</h2>
            <p className="text-gray-600 mb-6">
              {error || "The requested farmer profile could not be loaded."}
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/40 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Profile Header Card */}
        <Card className="mb-8 shadow-md border-0 relative">
          <CardContent className="p-8">
            {/* Add Friend Button Section */}
            <div className="absolute top-6 right-6 flex flex-col items-end">
              <Button
                onClick={handleAddFriend}
                disabled={isRequesting || requestStatus === "sent" || !user?._id}
                className={`flex items-center gap-2 min-w-[160px] justify-center
                  ${requestStatus === "sent"
                    ? "bg-green-600 hover:bg-green-600 cursor-default"
                    : "bg-emerald-600 hover:bg-emerald-700"} 
                  text-white transition-colors`}
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : requestStatus === "sent" ? (
                  <>Request Sent</>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Add Friend
                  </>
                )}
              </Button>

              {/* Error display – shows exact backend message */}
              {requestStatus === "error" && requestErrorMessage && (
                <div className="mt-2 flex items-center gap-1.5 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{requestErrorMessage}</span>
                </div>
              )}

              {/* Optional: small success hint (can be removed if not desired) */}
              {requestStatus === "sent" && (
                <div className="mt-1 text-green-600 text-xs">
                  Request has been sent
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-8">
              {/* Avatar / Icon */}
              <div className="w-28 h-28 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                <User className="h-14 w-14 text-emerald-700" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {capitalize(farmer.FirstName)} {capitalize(farmer.LastName)}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-4">
                  <MapPin className="h-5 w-5" />
                  <span>
                    {farmer.city || "—"}, {farmer.state || "Madhya Pradesh"}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">{totalSales} Sales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-amber-600" />
                    <span className="font-medium">{listedCrops.length} Active Listings</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Crop Listings */}
        <Card className="shadow-md border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Package className="h-6 w-6 text-emerald-600" />
              Listed Crops
            </CardTitle>
          </CardHeader>
          <CardContent>
            {listedCrops.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg">No crops are currently listed by this farmer.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listedCrops.map((crop) => (
                  <Card key={crop._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {crop.cropname}
                        </h3>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                          Grade {crop.grade || "—"}
                        </Badge>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium text-emerald-700">
                            ₹{crop.price} / {crop.unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-medium">
                            {crop.totalavailable} {crop.unit}
                          </span>
                        </div>
                        {crop.minquantity > 0 && (
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Min. order:</span>
                            <span>{crop.minquantity} {crop.unit}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmerFriendProfile;