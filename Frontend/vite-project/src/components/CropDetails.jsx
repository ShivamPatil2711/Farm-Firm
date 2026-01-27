// src/components/CropDetails.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from './AuthContext';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { IndianRupee, Package, Scale } from 'lucide-react';

const CropDetails = () => {
  const { cropId } = useParams();
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const [crop, setCrop] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Request form modal state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    requirement: '',
    deadline: '',
   
  });

  const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4003';

  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        const response = await fetch(
          `${backendApiUrl}/api/crop-details/${cropId}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch crop details');
        }

        const data = await response.json();
        console.log(data);

        setCrop(data.crop || null);
        setFarmer(data.farmer || null);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error(err.message || 'Error loading crop details');
      }
    };

    fetchCropDetails();
  }, [cropId]);

  const handleCallFarmer = () => {
    if (!isLoggedIn) {
      toast.error('Please log in to contact the farmer');
      navigate('/login-page');
      return;
    }

    const phoneNumber = farmer?.phoneNumber;
    if (!phoneNumber) {
      toast.error('Farmer contact number is not available');
      return;
    }

    const cleanPhone = phoneNumber.toString().replace(/\D/g, '');
    const fullNumber = cleanPhone.startsWith('91') 
      ? `+${cleanPhone}` 
      : `+91${cleanPhone}`;

    window.location.href = `tel:${fullNumber}`;
    toast.success(`Calling ${farmer?.name || 'farmer'}...`);
  };

  const handleRequestCrop = () => {
    if (!isLoggedIn) {
      toast.error('Please log in to request this crop');
      navigate('/login-page');
      return;
    }
    setShowRequestForm(true);
  };

  const handleCloseModal = () => {
    setShowRequestForm(false);
    setRequestData({
   
      requirement: '',
      deadline: '',
         });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!requestData.requirement.trim()) return toast.error('Requirement is required');
    if (!requestData.deadline) return toast.error('Deadline date is required');
  

    try {
      const response = await fetch(`${backendApiUrl}/api/crop-request/${cropId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Crop request submitted successfully!');
        handleCloseModal();
      } else {
        toast.error(result.error || 'Failed to submit request');
      }
    } catch (err) {
      toast.error('Network error while submitting request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-lg font-medium text-gray-600">Loading crop details...</p>
        </div>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold text-gray-600">Crop listing not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 space-y-12">
        {/* Hero / Main Image Section */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            {crop.img?.startsWith('/Uploads/') ? (
              <img
                src={`${backendApiUrl}${crop.img}`}
                alt={crop.cropname}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/600x400?text=Crop+Image+Not+Available";
                }}
              />
            ) : (
              <span className="text-9xl">🌾</span>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-8 left-8 text-white space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              {crop.cropname}
            </h1>

            <div className="flex items-center gap-3 text-lg md:text-xl">
              <FaMapMarkerAlt className="text-orange-500" />
              <span className="font-medium">
                {crop.location || 'Location not specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left - Crop Details */}
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white rounded-2xl shadow-md p-10 space-y-8">
              <h2 className="text-3xl font-bold text-gray-900">Crop Details</h2>

              <div className="space-y-6 text-gray-700 text-lg">
                <DetailRow label="Crop Name" value={crop.cropname} />
                <DetailRow
                  label="Price per unit"
                  value={
                    <span className="text-2xl font-bold text-orange-600">
                      ₹{crop.price?.toLocaleString() || 'N/A'}
                    </span>
                  }
                />
                <DetailRow
                  label="Minimum Order Quantity"
                  value={
                    <div className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-orange-600" />
                      {crop.minquantity || 'N/A'} units
                    </div>
                  }
                />
                <DetailRow
                  label="Total Available Quantity"
                  value={
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-orange-600" />
                      {crop.totalavailable || 'N/A'} units
                    </div>
                  }
                />
                <DetailRow
                  label="Grade / Quality"
                  value={
                    <span className={`inline-block px-4 py-1 rounded-full font-medium ${
                      crop.grade === 'A' ? 'bg-green-100 text-green-800' :
                      crop.grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      Grade {crop.grade || 'N/A'}
                    </span>
                  }
                />
              </div>
            </section>
          </div>

          {/* Right - Sidebar (Farmer Info + Actions) */}
          <div className="space-y-8 lg:sticky lg:top-10 self-start">
            <section className="bg-white rounded-2xl shadow-md p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Farmer Information</h2>

              <div className="space-y-4 text-gray-700">
                <p>
                  <span className="font-semibold">Name:</span>{' '}
                  {farmer?.FirstName || 'N/A'} {farmer?.LastName}
                </p>
                {farmer && (
                  <p>
                    <span className="font-semibold">Location:</span>{' '}
                    {farmer.city || 'N/A'} , {farmer.state || 'N/A'}
                  </p>
                )}
                {farmer?.phoneNumber && (
                  <p>
                    <span className="font-semibold">Phone:</span>{' '}
                    {farmer.phoneNumber}
                  </p>
                )}
              </div>

              <div className="space-y-4 pt-6">
                <button
                  onClick={handleRequestCrop}
                  className="w-full bg-orange-600 text-white py-4 rounded-xl font-semibold hover:bg-orange-700 transition"
                >
                  Request Crop
                </button>

                <button
                  onClick={handleCallFarmer}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  Call Farmer
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Request Crop Modal (Compact Size) */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md relative p-6 shadow-2xl">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-2xl font-bold text-gray-600 hover:text-gray-800"
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Request {crop.cropname}
            </h2>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
            

              {/* Requirement / Quantity */}
              <div>
                <label className="block text-gray-700 font-medium mb-1.5 text-sm">
                  Requirement / Quantity <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={requestData.requirement}
                  onChange={(e) => setRequestData({ ...requestData, requirement: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="e.g. 500 kg of Sharbati Wheat"
                  required
                />
              </div>

             

              {/* Deadline Date */}
              <div>
                <label className="block text-gray-700 font-medium mb-1.5 text-sm">
                  Deadline Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={requestData.deadline}
                  onChange={(e) => setRequestData({ ...requestData, deadline: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  required
                />
              </div>

            

              

              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition mt-2 text-sm"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 border-b border-gray-100 pb-4 last:border-0">
    <span className="font-semibold text-gray-800 min-w-[180px] md:min-w-[220px]">
      {label}
    </span>
    <div className="text-gray-700 flex-1">{value}</div>
  </div>
);

export default CropDetails;