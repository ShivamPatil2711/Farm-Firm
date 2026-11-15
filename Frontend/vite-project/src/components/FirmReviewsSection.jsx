import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'react-toastify';
import FirmReviewsModal from './FirmReviewsModal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4003';

export default function FirmReviewsSection({ firm }) {
  const [summary, setSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [aiSummary, setAiSummary] = useState(null);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/reviews/firms/${firm._id}`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load firm reviews');
        setSummary(data.summary || { averageRating: 0, reviewCount: 0 });
        const aiResponse = await fetch(`${BACKEND_URL}/api/reviews/firms/${firm._id}/summary`, {
          credentials: 'include'
        });
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          if (aiData.available) setAiSummary(aiData.summary);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (firm?._id) fetchSummary();
  }, [firm?._id]);

  return (
    <>
      <section className="mt-8 rounded-2xl border border-amber-100 bg-amber-50/50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Farmer Reviews</h2>
            <div className="mt-2 flex items-center gap-2 text-gray-700">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span>
                {summary.reviewCount
                  ? `${summary.averageRating.toFixed(1)} out of 5 · ${summary.reviewCount} review${summary.reviewCount === 1 ? '' : 's'}`
                  : 'No reviews yet'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowReviews(true)}
            className="rounded-xl border border-amber-500 px-4 py-2.5 font-medium text-amber-800 transition-colors hover:bg-amber-100"
          >
            View All Reviews
          </button>
        </div>
        {aiSummary && (
          <div className="mt-5 border-t border-amber-200 pt-5">
            <p className="text-sm font-semibold text-gray-900">AI-powered review summary</p>
            <p className="mt-2 text-sm leading-6 text-gray-700">{aiSummary.summary}</p>
            {aiSummary.positivePoints?.length > 0 && (
              <p className="mt-3 text-sm text-gray-700">
                <span className="font-medium">Common positives:</span> {aiSummary.positivePoints.join(', ')}
              </p>
            )}
            {aiSummary.concerns?.length > 0 && (
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-medium">Common concerns:</span> {aiSummary.concerns.join(', ')}
              </p>
            )}
            <p className="mt-3 text-xs text-gray-500">
              Generated from {aiSummary.reviewCount || summary.reviewCount} written reviews.
            </p>
          </div>
        )}
      </section>
      {showReviews && (
        <FirmReviewsModal
          firm={firm}
          onClose={() => setShowReviews(false)}
        />
      )}
    </>
  );
}
