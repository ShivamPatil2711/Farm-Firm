import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { Card, CardContent } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Input } from "./Input";
import {
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    Package,
    Loader2,
    ShoppingCart,
    Clock,
    TrendingUp,
    TrendingDown,
    Search,
    LayoutDashboard,
    History,
    Settings,
    IndianRupee,
    Star,
    MapPinIcon,
    UserPlus,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

const FirmProfilePage = () => {
    const navigate = useNavigate();
    const { user, isLoggedIn } = useContext(AuthContext);

    const [profileData, setProfileData] = useState(null);
    const [myRequests, setMyRequests] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [searchQuery, setSearchQuery] = useState("");

    // ── New state for pending friend requests ──
    const [friendRequests, setFriendRequests] = useState([]);
    const [friendRequestsLoading, setFriendRequestsLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }

        const fetchProfileData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch firm profile data
                const response = await fetch(`${BACKEND_URL}/api/firm/profile`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch profile data");
                }

                const data = await response.json();
                console.log("Fetched firm profile data:", data);
                setProfileData(data.firmProfile);

                // Fetch firm's requests
                const requestsResponse = await fetch(`${BACKEND_URL}/api/myrequests`, {
                    method: "GET",
                    credentials: "include",
                });

                if (requestsResponse.ok) {
                    const requestsData = await requestsResponse.json();
                    console.log("Fetched firm requests data:", requestsData);
                    if (requestsData.success) {
                        setMyRequests(requestsData.crop || []);
                    }
                }

                // Fetch farmers/suppliers
                const farmersResponse = await fetch(`${BACKEND_URL}/api/farmers`, {
                    method: "GET",
                    credentials: "include",
                });

                if (farmersResponse.ok) {
                    const farmersData = await farmersResponse.json();
                    console.log("Fetched farmers data:", farmersData);
                    if (farmersData.success) {
                        setFarmers(farmersData.farmers || []);
                    }
                }

                // ── NEW: Fetch pending friend requests received by this firm ──
                const friendReqResponse = await fetch(`${BACKEND_URL}/api/friend-requests/${user._id}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (friendReqResponse.ok) {
                    const reqData = await friendReqResponse.json();
                    setFriendRequests(reqData.requests || []);
                }

            } catch (err) {
                console.error("Error fetching profile:", err);
                setError(err.message);
            } finally {
                setLoading(false);
                setFriendRequestsLoading(false);
            }
        };

        fetchProfileData();
    }, [user, isLoggedIn, navigate]);

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

            setFriendRequests(prev => prev.filter(req => req._id !== requestId));
            alert("Friend request accepted.");
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

            setFriendRequests(prev => prev.filter(req => req._id !== requestId));
            alert("Friend request rejected.");
        } catch (err) {
            console.error("Reject friend request failed:", err);
            alert(err.message || "Could not reject friend request");
        }
    };

    // Calculate stats
    const totalPurchases = myRequests.filter((req) => req.status === "accepted" || req.status === "Accepted").length;
    const activeSuppliers = 8; // You can calculate from unique farmers
    const totalSpent = myRequests
        .filter((req) => req.status === "accepted" || req.status === "Accepted")
        .reduce((sum, req) => sum + (req.quantity * req.cropId?.price || 0), 0);
    const pendingOrders = myRequests.filter((req) => req.status === "pending" || req.status === "Pending").length;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md px-6 py-10">
                    <Loader2 className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Error</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="container mx-auto px-8 py-8 max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-foreground mb-2">
                            Welcome back! 👋
                        </h1>
                        <p className="text-muted-foreground">
                            Find the best farmers and crops for your business.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Total Purchases</p>
                                    <p className="text-3xl font-bold text-foreground mb-1">{totalPurchases}</p>
                                    <p className="text-xs text-muted-foreground">8 this month</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Active Suppliers</p>
                                    <p className="text-3xl font-bold text-foreground mb-1">{activeSuppliers}</p>
                                    <p className="text-xs text-firm">+3 new farmers</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <IndianRupee className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                                    <p className="text-3xl font-bold text-foreground mb-1">
                                        ₹{totalSpent.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">This quarter</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                                    <p className="text-3xl font-bold text-foreground mb-1">{pendingOrders}</p>
                                    <p className="text-xs text-muted-foreground">In progress</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Find Farmers Section */}
                        <div className="lg:col-span-2">
                            <Card>
                                <div className="p-6 border-b border-border">
                                    <h2 className="text-2xl font-bold text-foreground mb-4">Find Farmers</h2>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                placeholder="Search by crop, location, or farmer name..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 h-12"
                                            />
                                        </div>
                                        <Button className="bg-firm hover:bg-firm/90 h-12 px-8">
                                            Search
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    {farmers.length === 0 ? (
                                        <div className="text-center py-12">
                                            <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-muted-foreground">No farmers found</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {farmers.map((farmer) => (
                                                <Card key={farmer._id} className="hover:shadow-md transition-shadow">
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 rounded-full bg-farmer/10 flex items-center justify-center">
                                                                    <span className="text-xl font-bold text-farmer">{farmer.FirstName.charAt(0)}</span>
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className="font-semibold text-foreground">{farmer.FirstName} {farmer.LastName}</h3>
                                                                        <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                                                                            Verified
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                        <MapPinIcon className="h-3 w-3" />
                                                                        <span>{farmer.city}, {farmer.state}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="text-sm font-semibold">4.5</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {farmer.listedCrops && farmer.listedCrops.map((crop) => (
                                                                <Badge key={crop._id} className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                                                                    {crop.cropname}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm text-muted-foreground">
                                                                45 sales completed
                                                            </p>
                                                            <div className="flex items-center text-sm text-muted-foreground">
                                                                <Phone className="h-4 w-4 mr-2" />
                                                                {farmer.phoneNumber}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* ── Pending Friend Requests (right column) ── */}
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
                </div>
            </main>
        </div>
    );
};

export default FirmProfilePage;