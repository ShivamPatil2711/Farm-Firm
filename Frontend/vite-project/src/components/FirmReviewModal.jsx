import { useEffect, useState } from 'react';
import { Star, X } from 'lucide-react';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4003';

export default function FirmReviewModal({ request, onClose, onSaved }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadReview = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/reviews/requests/${request._id}`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load review');
        if (data.review) {
          setRating(data.review.rating);
          setComment(data.review.comment || '');
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [request._id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/reviews/requests/${request._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating, comment })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save review');
      toast.success(data.message);
      onSaved(data.review);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Review {request.firmId?.CompanyName}</h2>
            <p className="text-sm text-gray-500">Share your experience with this buyer.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Close review">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <p className="py-6 text-center text-gray-500">Loading review...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Rating</p>
              <div className="flex gap-1" role="radiogroup" aria-label="Firm rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded p-1"
                    aria-label={`${value} star${value > 1 ? 's' : ''}`}
                  >
                    <Star className={`h-8 w-8 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Comment (optional)</span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={1000}
                rows={4}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="How was your experience?"
              />
              <span className="mt-1 block text-right text-xs text-gray-500">{comment.length}/1000</span>
            </label>

            <button type="submit" disabled={saving} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300">
              {saving ? 'Saving...' : 'Save Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
