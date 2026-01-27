// src/components/MyRequests.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IndianRupee, Package, Calendar, MapPin, Building, AlertTriangle,Clock } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4003';

const MyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BACKEND_URL}/api/myrequests`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please log in to view your requests');
          }
          throw new Error('Failed to fetch your requests');
        }

        const data = await response.json();
           console.log("jhbjhhug",data);
        if (data.success) {
          setRequests(data.crop || []);
        } else {
          setError(data.error || 'Unable to load your requests');
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError(err.message || 'An unexpected error occurred');
        toast.error(err.message || 'Could not load your crop requests');
      } finally {
        setLoading(false);
      }
    };

    fetchMyRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6 py-10">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 pt-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Crop Requests</h1>
            <p className="text-gray-600 mt-2">
              Track the purchase requests you have sent to farmers
            </p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No requests yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't made any crop requests yet.
            </p>
            <button
              onClick={() => navigate('/crops')}
              className="bg-orange-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-orange-700 transition"
            >
              Browse Crops
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
              >
                {/* Crop Image */}
                <div className="h-48 bg-gray-100 relative">
                  {req.cropId?.img?.startsWith('/Uploads/') ? (
                    <img
                      src={`${BACKEND_URL}${req.cropId.img}`}
                      alt={req.cropId.cropname}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x200?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-100 to-gray-200">
                      🌾
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {req.cropId?.cropname || 'Crop Request'}
                  </h3>

                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">
                        ₹{req.cropId?.price?.toLocaleString() || 'N/A'} per unit
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-orange-600" />
                      <span>Requested: {req.requirement || 'N/A'}</span>
                    </div>
                                                
                   <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>
                        Requested on: {new Date(req.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
  <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span>
                        Deadline: {req.deadline ? new Date(req.deadline).toLocaleDateString('en-IN') : 'N/A'}
                      </span>
                    </div>

                    <div className="pt-2">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                       {req.status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      Farmer: <span className="font-medium">{req.farmerId?.FirstName || 'N/A'} {req.farmerId?.LastName || 'N/A'}</span>
                    </p>
                    {req.farmerId?.phoneNumber && (
                      <p className="text-sm text-gray-600 mt-1">
                        Contact: {req.farmerId.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;