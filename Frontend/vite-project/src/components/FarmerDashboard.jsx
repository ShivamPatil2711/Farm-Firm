// src/pages/FarmerDashboard.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import {
  Package,
  ShoppingCart,
  IndianRupee,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  X,
  UserPlus,

  CheckCircle2,     // for Accept
  XCircle,
  AlertCircle,
  Users,
  Building2,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [profileData, setProfileData] = useState(null);
  const [listedCrops, setListedCrops] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [editFormData, setEditFormData] = useState({
    cropname: "",
    totalavailable: "",
    price: "",
    unit: "kg",
    grade: "A",
    minquantity: "",
    status: "Active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── New state for received friend requests ──
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendRequestsLoading, setFriendRequestsLoading] = useState(false);

  // ── State for friends lists ──
  const [farmerFriends, setFarmerFriends] = useState([]);
  const [firmFriends, setFirmFriends] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch profile
        const profileRes = await fetch(`${BACKEND_URL}/api/farmer/profile`, {
          method: "GET",
          credentials: "include",
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          console.log("Profile response:", profileData);
          setProfileData(profileData.farmerProfile);

          // Extract friends data from profile
          if (profileData.farmerProfile) {
            setFarmerFriends(profileData.farmerProfile.farmerfriend || []);
            setFirmFriends(profileData.farmerProfile.firmfriend || []);
          }
        }

        // Fetch listed crops
        const cropsRes = await fetch(`${BACKEND_URL}/api/listed-crops`, {
          method: "GET",
          credentials: "include",
        });
        if (cropsRes.ok) {
          const cropsData = await cropsRes.json();
          if (cropsData.success) {
            setListedCrops(cropsData.listedCrops || []);
          }
        }

        // Fetch crop requests
        const requestsRes = await fetch(`${BACKEND_URL}/api/requested-crops`, {
          method: "GET",
          credentials: "include",
        });
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          if (requestsData.success) {
            setRequests(requestsData.requests || []);
          }
        }

        // ── Updated: Fetch pending received friend requests ──
        setFriendRequestsLoading(true);
        const friendReqRes = await fetch(
          `${BACKEND_URL}/api/friend-requests/${user?._id}`,  // ← corrected endpoint
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (friendReqRes.ok) {
          const data = await friendReqRes.json();
          console.log("Fetched friend requests:", data);
          if (data.success) {
            setFriendRequests(data.requests || []);
          } else {
            console.warn("Friend requests API returned success: false", data);
          }
        } else {
          console.warn("Failed to fetch friend requests", friendReqRes.status);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
        setFriendRequestsLoading(false);
      }
    };

    if (user?._id) {
      fetchData();
    }
  }, [user?._id]);

  // Calculate stats (unchanged)
  const activeListings = listedCrops.filter((crop) => crop.status === "Active").length;
  const pendingOrders = requests.filter((req) => req.status === "Pending").length;
  const totalSales = requests.filter((req) => req.status === "Accepted").length;
  const totalEarnings = requests
    .filter((req) => req.status === "Accepted")
    .reduce((sum, req) => sum + (req.requirement * req.cropId?.price || 0), 0);

  // ── Edit crop handlers (unchanged) ──
  const handleEditClick = (crop) => {
    setSelectedCrop(crop);
    setEditFormData({
      cropname: crop.cropname || "",
      totalavailable: crop.totalavailable || "",
      price: crop.price || "",
      unit: crop.unit || "kg",
      grade: crop.grade || "A",
      minquantity: crop.minquantity || "",
      status: crop.status || "Active",
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedCrop(null);
    setEditFormData({
      cropname: "",
      totalavailable: "",
      price: "",
      unit: "kg",
      grade: "A",
      minquantity: "",
      status: "Active",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAcceptRequest = async (requestId) => {
    if (!confirm("Accept this friend request?")) return;

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/friend-requests/accept/${requestId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to accept request");
      }

      setFriendRequests(prev =>
        prev.filter(req => req._id !== requestId)
      );

    } catch (err) {
      console.error("Accept friend request failed:", err);
      alert(err.message || "Could not accept friend request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!confirm("Reject this friend request? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/friend-requests/reject/${requestId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to reject request");
      }

      setFriendRequests((prev) =>
        prev.filter((req) => req._id.toString() !== requestId.toString())
      );
      alert("Friend request rejected.");
    } catch (err) {
      console.error("Reject friend request failed:", err);
      alert(err.message || "Could not reject friend request");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/crops/${selectedCrop._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedCrop = await response.json();
        setListedCrops((prev) =>
          prev.map((crop) =>
            crop._id === selectedCrop._id ? { ...updatedCrop.crop, ...editFormData } : crop
          )
        );
        handleCloseModal();
        alert("Crop updated successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to update crop: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating crop:", error);
      alert("An error occurred while updating the crop");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
        return "bg-farmer/10 text-farmer border-farmer/30";
      case "B":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "C":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-farmer/10 text-farmer border-farmer/30";
      case "Pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome back, {profileData?.FirstName || user?.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your crops today.
            </p>
          </div>
          <Button
            onClick={() => navigate("/add-crop")}
            variant="farmer"
            size="lg"
            className="shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Listing
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-farmer/10 rounded-lg">
                  <Package className="h-6 w-6 text-farmer" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Listings</p>
                <p className="text-3xl font-bold text-foreground mb-1">{activeListings}</p>
                <p className="text-xs text-farmer">+2 this week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-foreground mb-1">{totalSales}</p>
                <p className="text-xs text-muted-foreground">{totalSales} transactions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-foreground mb-1">
                  ₹{totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">+15% this month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-foreground mb-1">{pendingOrders}</p>
                <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Your Crop Listings */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Your Crop Listings</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/listed-crops")}
                  >
                    View All
                  </Button>
                </div>
              </div>
              <CardContent className="p-0">
                {listedCrops.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No crops listed yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Crop</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Quantity</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Price</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Quality</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Listed</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listedCrops.slice(0, 5).map((crop) => (
                          <tr
                            key={crop._id}
                            className="border-b border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-4">
                              <span className="font-medium text-foreground">{crop.cropname}</span>
                            </td>
                            <td className="p-4 text-foreground">
                              {crop.totalavailable} {crop.unit}
                            </td>
                            <td className="p-4 text-foreground font-semibold">
                              ₹{crop.price}/{crop.unit}
                            </td>
                            <td className="p-4">
                              <Badge className={getGradeColor(crop.grade)}>
                                Grade {crop.grade}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(crop.status || "active")}>
                                {crop.status || "Active"}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {new Date(crop.createdAt).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => navigate(`/crop/${crop._id}`)}
                                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                                >
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                </button>
                                <button
                                  onClick={() => handleEditClick(crop)}
                                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                                >
                                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                                </button>
                                <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── NEW: Pending Friend Requests Section ── */}
           <div className="lg:col-span-1">
                            <Card className="h-full shadow-md">
                                <div className="px-6 py-4 border-b bg-muted/40">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <UserPlus className="h-5 w-5 text-amber-600" />
                                        Pending Friend Requests
                                    </h3>
                                </div>
                                <CardContent className="p-6">
                                    {friendRequestsLoading ? (
                                        <div className="flex flex-col items-center justify-center py-10">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                                            <p className="text-sm text-muted-foreground">Loading requests...</p>
                                        </div>
                                    ) : friendRequests.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground">
                                            <UserPlus className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                            <p>No pending friend requests</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {friendRequests.map((req) => (
                                               <div
  key={req._id}
  className="flex flex-col gap-5 p-4 sm:p-5 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
>
  {/* Header / Sender Info */}
  <div className="flex items-start gap-3.5">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
      <UserPlus className="h-5 w-5 text-primary" />
    </div>

    <div className="min-w-0 flex-1">
      <p className="font-semibold text-base leading-tight truncate">
        {req.senderType === "farmer"
          ? `${req.sender?.FirstName || ""} ${req.sender?.LastName || ""}`.trim() || "Unknown Farmer"
          : req.sender?.CompanyName || "Unknown Company"}
      </p>

      <p className="mt-0.5 text-sm text-muted-foreground truncate">
        {req.sender?.city && req.sender?.state
          ? `${req.sender.city}, ${req.sender.state}`
          : "Location not available"}
      </p>

      <p className="mt-1 text-xs text-muted-foreground/80">
        {new Date(req.timestamp || req.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  </div>

  {/* Action Buttons – Responsive & Joined Style */}
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3 min-w-0">
  <button
    type="button"
    className={`
      flex items-center justify-center gap-2
      flex-1 sm:flex-none px-5 py-2.5
      text-sm font-medium
      bg-green-600 hover:bg-green-700 active:bg-green-800
      text-white
      rounded-lg shadow-sm
      transition-all duration-150
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2
      disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none
    `}
    onClick={() => handleAcceptRequest(req._id)}
    disabled={req.isProcessing}
  >
    {req.isProcessing ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <CheckCircle2 className="h-4 w-4" />
    )}
    Accept
  </button>

  <button
    type="button"
    className={`
      flex items-center justify-center gap-2
      flex-1 sm:flex-none px-5 py-2.5
      text-sm font-medium
      bg-red-600 hover:bg-red-700 active:bg-red-800
      text-white
      rounded-lg shadow-sm
      transition-all duration-150
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
      disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none
    `}
    onClick={() => handleRejectRequest(req._id)}
    disabled={req.isProcessing}
  >
    {req.isProcessing ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <XCircle className="h-4 w-4" />
    )}
    Reject
  </button>
</div>
</div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
        </div>

        {/* Friends Section - Farmer Friends and Firm Friends */}
        <div className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Farmer Friends */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-farmer" />
                  Farmer Friends
                  <Badge className="ml-auto bg-farmer/10 text-farmer border-farmer/30">
                    {farmerFriends.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {farmerFriends.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No farmer friends yet</p>
                    <p className="text-xs mt-1">Connect with other farmers to expand your network</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {farmerFriends.map((friend, index) => (
                      <div
                        key={friend._id || index}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-farmer/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-6 w-6 text-farmer" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground truncate">
                              {friend.FirstName && friend.LastName
                                ? `${friend.FirstName} ${friend.LastName}`
                                : friend.name || "Farmer"}
                            </p>
                            {(friend.city || friend.state) && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">
                                  {friend.city && friend.state
                                    ? `${friend.city}, ${friend.state}`
                                    : friend.city || friend.state || "Location not available"}
                                </span>
                              </div>
                            )}
                            {friend.phoneNumber && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Phone className="h-3 w-3" />
                                <span>{friend.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/profile/${friend._id}?userType=farmer`)}
                          className="flex-shrink-0"
                        >
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Firm Friends */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Firm Friends
                  <Badge className="ml-auto bg-blue-500/10 text-blue-600 border-blue-500/30">
                    {firmFriends.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {firmFriends.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No firm connections yet</p>
                    <p className="text-xs mt-1">Connect with firms to expand your business opportunities</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {firmFriends.map((firm, index) => (
                      <div
                        key={firm._id || index}
                        className="flex items-center justify-between p-4 bg-blue-500/5 rounded-lg border border-blue-500/20 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground truncate">
                              {firm.CompanyName || "Company"}
                            </p>
                            {firm.ContactPerson && (
                              <p className="text-xs text-muted-foreground truncate">
                                Contact: {firm.ContactPerson}
                              </p>
                            )}
                            {(firm.city || firm.state) && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">
                                  {firm.city && firm.state
                                    ? `${firm.city}, ${firm.state}`
                                    : firm.city || firm.state || "Location not available"}
                                </span>
                              </div>
                            )}
                            {firm.email && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{firm.email}</span>
                              </div>
                            )}
                            {firm.phoneNumber && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Phone className="h-3 w-3" />
                                <span>{firm.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/profile/${firm._id}?userType=firm`)}
                          className="flex-shrink-0"
                        >
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal (unchanged) */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-border animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-farmer/10 to-transparent border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-farmer/10 rounded-lg">
                  <Edit2 className="h-5 w-5 text-farmer" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Edit Crop Details</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)] bg-white ">
              <div className="px-8 py-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Crop Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    name="cropname"
                    value={editFormData.cropname}
                    onChange={handleInputChange}
                    placeholder="e.g., Wheat, Rice, Tomatoes"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Total Available <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      name="totalavailable"
                      value={editFormData.totalavailable}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Minimum Order Quantity <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      name="minquantity"
                      value={editFormData.minquantity}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Price per Unit (₹) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Unit <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={editFormData.unit}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, unit: value }))
                      }
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="quintal">Quintal</SelectItem>
                        <SelectItem value="ton">Ton</SelectItem>
                        <SelectItem value="piece">Piece</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Quality Grade <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={editFormData.grade}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, grade: value }))
                      }
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Grade A (Premium)</SelectItem>
                        <SelectItem value="B">Grade B (Standard)</SelectItem>
                        <SelectItem value="C">Grade C (Basic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Listing Status <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 px-8 py-6 bg-slate-50 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  size="lg"
                  className="min-w-[120px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="farmer"
                  disabled={isSubmitting}
                  size="lg"
                  className="min-w-[160px] shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;