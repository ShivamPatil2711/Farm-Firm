// src/components/ListedCrops.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Package, MapPin, IndianRupee, AlertTriangle } from "lucide-react";

const BACKEND_URL = "http://localhost:4003"; // or import.meta.env.VITE_BACKEND_API_URL

const ListedCrops = () => {
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyCrops = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BACKEND_URL}/api/listed-crops`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please log in to view your listed crops");
          }
          throw new Error("Failed to fetch your listed crops");
        }

        const data = await response.json();
console.log(data.listedCrops)
        if (data.success) {
          setCrops(data.listedCrops || []);
        } else {
          setError(data.error || "Unable to load your crops");
        }
      } catch (err) {
        console.error("Error fetching listed crops:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCrops();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your listed crops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6 py-10">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 pt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Listed Crops</h1>
            <p className="text-muted-foreground mt-2">
              Manage the crops you have listed for sale
            </p>
          </div>

          <Button onClick={() => navigate("/add-crop")}>
            List New Crop
          </Button>
        </div>

        {/* Content */}
        {crops.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No crops listed yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start by adding your first crop to the marketplace
            </p>
            <Button onClick={() => navigate("/add-crop")}>
              Add Your First Crop
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {crops.map((crop) => (
              <Card
                key={crop._id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="h-48 bg-muted relative overflow-hidden">
                  {crop.img?.startsWith("/Uploads/") ? (
                    <img
                      src={`${BACKEND_URL}${crop.img}`}
                      alt={crop.cropname}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder-crop.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-muted to-muted/70">
                      🌾
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-foreground">
                      {crop.cropname}
                    </h3>
                    <Badge
                      variant="outline"
                      className={
                        crop.grade === "A"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : crop.grade === "B"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                          : "bg-orange-100 text-orange-800 border-orange-300"
                      }
                    >
                      Grade {crop.grade || "N/A"}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      <span className="font-medium">₹{crop.price} per unit</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span>
                        Total available: {crop.totalavailable} units
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span>Min order: {crop.minquantity} units</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListedCrops;