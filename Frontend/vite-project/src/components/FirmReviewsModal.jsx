import { useEffect, useState } from 'react';
import { Star, Users, X } from 'lucide-react';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4003';

export default function FirmReviewsModal({ firm, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [aiSummary, setAiSummary] = useState(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [viewerCanFilterFriends, setViewerCanFilterFriends] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/reviews/firms/${firm._id}`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load reviews');
        setReviews(data.reviews || []);
        setSummary(data.summary || { averageRating: 0, reviewCount: 0 });
        setViewerCanFilterFriends(Boolean(data.viewerCanFilterFriends));
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAiSummary = async () => {
      try {
        const aiResponse = await fetch(`${BACKEND_URL}/api/reviews/firms/${firm._id}/summary`, {
          credentials: 'include'
        });
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          if (aiData.available) setAiSummary(aiData.summary);
        }
      } catch (error) {
        console.error('Error loading AI review summary:', error);
      } finally {
        setAiSummaryLoading(false);
      }
    };

    fetchReviews();
    fetchAiSummary();
  }, [firm._id]);

  const visibleReviews = friendsOnly ? reviews.filter((review) => review.isFriend) : reviews;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{firm.CompanyName} Reviews</h2>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>
                {summary.reviewCount
                  ? `${summary.averageRating.toFixed(1)} out of 5 · ${summary.reviewCount} review${summary.reviewCount === 1 ? '' : 's'}`
                  : 'No reviews yet'}
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Close reviews">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          {loading ? (
            <p className="py-8 text-center text-gray-500">Loading reviews...</p>
          ) : (
            <>
              <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-sm font-semibold text-gray-900">AI-powered review summary</p>
                {aiSummaryLoading ? (
                  <p className="mt-2 text-sm text-gray-500">Preparing summary...</p>
                ) : aiSummary ? (
                  <>
                    <p className="mt-2 text-sm leading-6 text-gray-700">{aiSummary.summary}</p>
                    {aiSummary.positivePoints?.length > 0 && (
                      <p className="mt-3 text-sm text-gray-700">
                        <span className="font-medium">Common positives:</span>{' '}
                        {aiSummary.positivePoints.join(', ')}
                      </p>
                    )}
                    {aiSummary.concerns?.length > 0 && (
                      <p className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Common concerns:</span>{' '}
                        {aiSummary.concerns.join(', ')}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-gray-500">
                      Generated from {aiSummary.reviewCount || summary.reviewCount} written reviews.
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">
                    An AI summary will appear after at least three written reviews are available.
                  </p>
                )}
              </div>

              {viewerCanFilterFriends && (
                <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <span>{friendsOnly ? 'Reviews from your farmer friends' : 'All farmer reviews'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFriendsOnly((current) => !current)}
                    className="rounded-lg border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    {friendsOnly ? 'Show all reviews' : 'Show friend reviews'}
                  </button>
                </div>
              )}

              {visibleReviews.length === 0 ? (
                <p className="py-8 text-center text-gray-500">
                  {friendsOnly ? 'Your farmer friends have not reviewed this firm yet.' : 'No farmers have reviewed this firm yet.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {visibleReviews.map((review) => (
                    <article key={review._id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.farmer?.FirstName} {review.farmer?.LastName}
                          </p>
                          <div className="mt-1 flex" aria-label={`${review.rating} out of 5 stars`}>
                            {[1, 2, 3, 4, 5].map((value) => (
                              <Star
                                key={value}
                                className={`h-4 w-4 ${value <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <time className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-IN')}
                        </time>
                      </div>
                      {review.comment && <p className="mt-3 text-sm text-gray-700">{review.comment}</p>}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
