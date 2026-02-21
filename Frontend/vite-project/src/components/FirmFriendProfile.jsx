// src/pages/FirmFriendProfile.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";
import { User, MapPin, Building, Phone, Mail, Loader2, UserPlus, AlertCircle } from "lucide-react";

import { AuthContext } from "./AuthContext";   // Adjust path if needed

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

const FirmFriendProfile = ({ id }) => {
  const firmId = id;
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);   // expected: { _id, userType, ... }

  const [firm, setFirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Friend request states
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);     // null | 'sent' | 'error'
  const [requestErrorMessage, setRequestErrorMessage] = useState("");

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchPublicFirmData = async () => {
      if (!firmId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BACKEND_URL}/api/friend-profile/${firmId}?userType=firm`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to load firm profile");
        }

        const data = await response.json();
        console.log("Fetched firm profile:", data);

        setFirm(data.profile || null);
      } catch (err) {
        console.error("Error loading public firm profile:", err);
        setError(err.message || "Could not load firm information");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicFirmData();
  }, [firmId]);

  const handleAddFriend = async () => {
    if (!user?._id || !firmId) {
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
          // "Authorization": `Bearer ${user.token}`, // ← add if your API requires JWT
        },
        body: JSON.stringify({
          senderId: user._id,
          receiverId: firmId,
          senderType: user.userType,     // "farmer" or "firm"
          receiverType: "firm",
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
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error || !firm) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="pt-10 pb-8">
            <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Company not found</h2>
            <p className="text-gray-600 mb-6">
              {error || "The requested company profile could not be loaded."}
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/40 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-lg border-0 overflow-hidden relative">
          <CardContent className="p-8 md:p-12">
            {/* Add Friend Button – top right */}
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

              {requestStatus === "error" && requestErrorMessage && (
                <div className="mt-2 flex items-center gap-1.5 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{requestErrorMessage}</span>
                </div>
              )}

              {requestStatus === "sent" && (
                <div className="mt-1 text-green-600 text-xs">
                  Request has been sent
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
              {/* Company Icon / Avatar */}
              <div className="w-32 h-32 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Building className="h-16 w-16 text-emerald-700" />
              </div>

              {/* Main Info */}
              <div className="flex-1 text-center md:text-left space-y-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {firm.CompanyName || "Company Name"}
                  </h1>
                  {firm.ContactPerson && (
                    <p className="text-lg text-gray-700">
                      Contact Person: {capitalize(firm.ContactPerson)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-6 w-6 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p>
                        {firm.city || "—"}, {firm.state || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  {firm.phoneNumber && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-6 w-6 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p>{firm.phoneNumber}</p>
                      </div>
                    </div>
                  )}

                  {/* Email (if public) */}
                  {firm.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-6 w-6 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="break-all">{firm.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optional small footer note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          This is a public profile view. Contact the company directly using the information above.
        </div>
      </div>
    </div>
  );
};

export default FirmFriendProfile;