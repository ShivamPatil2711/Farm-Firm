// src/components/FarmerRequests.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  IndianRupee,
  Package,
  Calendar,
  MapPin,
  Building,
  AlertTriangle,
  Clock,
  Check,
  X,
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4003';

const FarmerRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchFarmerRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BACKEND_URL}/api/requested-crops`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.warn('Please log in to view incoming requests');
            navigate('/login'); // or wherever your login route is
            return;
          }
          throw new Error('Failed to fetch incoming crop requests');
        }

        const data = await response.json();

        if (data?.success) {
          setRequests(Array.isArray(data.requests) ? data.requests : []);
        } else {
          throw new Error(data?.error || 'Unable to load incoming requests');
        }
      } catch (err) {
        const message = err.message || 'An unexpected error occurred';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerRequests();
  }, [navigate]);

  const handleAccept = async (requestId) => {
    if (!window.confirm('Are you sure you want to accept this request?')) return;

    setProcessingId(requestId);

    try {
      const response = await fetch(`${BACKEND_URL}/api/accept/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Request accepted successfully');
        setRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status: 'accepted' } : r))
        );
      } else {
        toast.error(result.error || 'Failed to accept request');
      }
    } catch (err) {
      toast.error('Network error while accepting request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;

    setProcessingId(requestId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/reject/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Request rejected successfully');
        setRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status: 'rejected' } : r))
        );
      } else {
        toast.error(result.error || 'Failed to reject request');
      }
    } catch (err) {
      toast.error('Network error while rejecting request');
    } finally {
      setProcessingId(null);
    }
  };

  // ────────────────────────────────────────────────
  //  Render
  // ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Loading incoming requests...</p>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Incoming Crop Requests</h1>
            <p className="text-gray-600 mt-2">Requests from firms/buyers for your listed crops</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No incoming requests yet</h3>
            <p className="text-gray-600 mb-6">
              When firms or buyers request your crops, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => {
              const isProcessing = processingId === req._id;
              const status = req.status || 'pending';

              const cropName = req.cropId?.cropname || 'Unknown Crop';
              const firmName = req.firmId?.CompanyName || 'Unknown Firm';
              const firmCity = req.firmId?.city || '—';
              const firmState = req.firmId?.state || '—';
              const phone = req.firmId?.phoneNumber || 'Not provided';

              return (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
                >
                  {/* Crop Image */}
                  <div className="h-48 bg-gray-100 relative">
                    {req.cropId?.img?.startsWith('/Uploads/') ? (
                      <img
                        src={`${BACKEND_URL}${req.cropId.img}`}
                        alt={cropName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-100 to-gray-200">
                        🌾
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-5">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{cropName}</h3>

                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">
                          ₹{(req.cropId?.price ?? 0).toLocaleString('en-IN')} per unit
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-orange-600" />
                        <span>Requested: {req.requirement ?? '—'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <span>
                          Deadline:{' '}
                          {req.deadline
                            ? new Date(req.deadline).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-orange-600" />
                        <span>Firm: {firmName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-orange-600" />
                        <span>
                          {firmCity}, {firmState}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span>
                          Requested on:{' '}
                          {new Date(req.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="pt-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-sm text-gray-600">
                        Contact: <span className="font-medium">{phone}</span>
                      </p>
                    </div>

                    {status === 'Pending' && (
                      <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleAccept(req._id)}
                          disabled={isProcessing}
                          aria-disabled={isProcessing}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition ${
                            isProcessing
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                          }`}
                        >
                          {isProcessing ? (
                            <Clock className="h-5 w-5 animate-spin" />
                          ) : (
                            <Check className="h-5 w-5" />
                          )}
                          Accept
                        </button>

                        <button
                          onClick={() => handleReject(req._id)}
                          disabled={isProcessing}
                          aria-disabled={isProcessing}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition ${
                            isProcessing
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
                          }`}
                        >
                          {isProcessing ? (
                            <Clock className="h-5 w-5 animate-spin" />
                          ) : (
                            <X className="h-5 w-5" />
                          )}
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerRequests;