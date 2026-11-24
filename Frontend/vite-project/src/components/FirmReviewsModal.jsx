import { useEffect, useState } from 'react';
import { Star, Users, X, Languages, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { translateToHindi, translateListToHindi } from '../lib/translator';

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4003';

export default function FirmReviewsModal({ firm, initialLang = 'en', onClose }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [aiSummary, setAiSummary] = useState(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [viewerCanFilterFriends, setViewerCanFilterFriends] = useState(false);
  const [summaryLang, setSummaryLang] = useState(initialLang); // 'en' | 'hi'
  const [isTranslating, setIsTranslating] = useState(false);
  const [dynamicHindi, setDynamicHindi] = useState(null);
  const [translatedComments, setTranslatedComments] = useState({});

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
          if (aiData.available) {
            setAiSummary(aiData.summary);
            if (aiData.summary?.summary_hi) {
              setDynamicHindi({
                summary: aiData.summary.summary_hi,
                positives: aiData.summary.positivePoints_hi || [],
                concerns: aiData.summary.concerns_hi || []
              });
            }
          }
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

  // Handle switching languages: translates summary & reviews on-demand
  const handleLanguageChange = async (lang) => {
    setSummaryLang(lang);
    if (lang === 'hi') {
      setIsTranslating(true);
      try {
        // Translate AI summary if not already available
        if (!dynamicHindi && aiSummary) {
          if (aiSummary.summary_hi) {
            setDynamicHindi({
              summary: aiSummary.summary_hi,
              positives: aiSummary.positivePoints_hi || [],
              concerns: aiSummary.concerns_hi || []
            });
          } else {
            const [transSummary, transPos, transConcerns] = await Promise.all([
              translateToHindi(aiSummary.summary),
              translateListToHindi(aiSummary.positivePoints || []),
              translateListToHindi(aiSummary.concerns || [])
            ]);
            setDynamicHindi({
              summary: transSummary,
              positives: transPos,
              concerns: transConcerns
            });
          }
        }

        // Translate individual review comments that haven't been translated yet
        const untranslated = reviews.filter(
          (r) => r.comment && !translatedComments[r._id]
        );
        if (untranslated.length > 0) {
          const translations = await Promise.all(
            untranslated.map(async (r) => ({
              id: r._id,
              text: await translateToHindi(r.comment)
            }))
          );
          setTranslatedComments((prev) => {
            const next = { ...prev };
            translations.forEach((t) => {
              next[t.id] = t.text;
            });
            return next;
          });
        }
      } catch (err) {
        console.error('Translation error:', err);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const isHindi = summaryLang === 'hi';
  const displaySummary = isHindi
    ? dynamicHindi?.summary || aiSummary?.summary_hi || aiSummary?.summary
    : aiSummary?.summary;
  const displayPositives = isHindi
    ? dynamicHindi?.positives?.length ? dynamicHindi.positives : aiSummary?.positivePoints_hi?.length ? aiSummary.positivePoints_hi : aiSummary?.positivePoints
    : aiSummary?.positivePoints;
  const displayConcerns = isHindi
    ? dynamicHindi?.concerns?.length ? dynamicHindi.concerns : aiSummary?.concerns_hi?.length ? aiSummary.concerns_hi : aiSummary?.concerns
    : aiSummary?.concerns;

  const visibleReviews = friendsOnly
    ? reviews.filter((review) => review.isFriendReview)
    : reviews;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {firm.CompanyName} — {isHindi ? 'समीक्षाएं' : 'Reviews'}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>
                {summary.reviewCount
                  ? `${summary.averageRating.toFixed(1)} / 5 · ${summary.reviewCount} ${isHindi ? 'समीक्षाएं' : 'reviews'}`
                  : isHindi ? 'कोई समीक्षा नहीं' : 'No reviews yet'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Close reviews"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          {loading ? (
            <p className="py-8 text-center text-gray-500">
              {isHindi ? 'समीक्षाएं लोड हो रही हैं...' : 'Loading reviews...'}
            </p>
          ) : (
            <>
              {/* AI-Powered Review Summary Section */}
              <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                {/* Header with Title and Toggle Button */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-emerald-700" />
                    <span className="text-sm font-semibold text-gray-900">
                      {isHindi ? 'AI समीक्षा सारांश' : 'AI-powered review summary'}
                    </span>
                    {isTranslating && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        अनुवाद हो रहा है...
                      </span>
                    )}
                  </div>

                  {/* Prominent Language Toggle Button */}
                  <div className="inline-flex items-center rounded-lg border border-emerald-300 bg-white p-0.5 text-xs font-medium shadow-xs">
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('en')}
                      className={`flex items-center gap-1 rounded-md px-3 py-1 font-semibold transition-all ${
                        !isHindi
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      aria-pressed={!isHindi}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('hi')}
                      className={`flex items-center gap-1 rounded-md px-3 py-1 font-semibold transition-all ${
                        isHindi
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      aria-pressed={isHindi}
                    >
                      🇮🇳 हिन्दी
                    </button>
                  </div>
                </div>

                {/* AI Summary Body */}
                {aiSummaryLoading ? (
                  <p className="mt-2 text-sm text-gray-500">
                    {isHindi ? 'सारांश तैयार किया जा रहा है...' : 'Preparing summary...'}
                  </p>
                ) : aiSummary ? (
                  <>
                    <p className="mt-3 text-sm leading-6 text-gray-700">{displaySummary}</p>
                    {displayPositives?.length > 0 && (
                      <p className="mt-3 text-sm text-gray-700">
                        <span className="font-medium text-emerald-800">
                          {isHindi ? 'मुख्य सकारात्मक पहलू:' : 'Common positives:'}
                        </span>{' '}
                        {displayPositives.join(', ')}
                      </p>
                    )}
                    {displayConcerns?.length > 0 && (
                      <p className="mt-2 text-sm text-gray-700">
                        <span className="font-medium text-rose-800">
                          {isHindi ? 'मुख्य चिंताएं:' : 'Common concerns:'}
                        </span>{' '}
                        {displayConcerns.join(', ')}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-gray-500">
                      {isHindi
                        ? `${aiSummary.reviewCount || summary.reviewCount} किसान समीक्षाओं के आधार पर तैयार किया गया।`
                        : `Generated from ${aiSummary.reviewCount || summary.reviewCount} written reviews.`}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">
                    {isHindi
                      ? 'कम से कम तीन समीक्षाएं उपलब्ध होने के बाद AI सारांश दिखाई देगा।'
                      : 'An AI summary will appear after at least three written reviews are available.'}
                  </p>
                )}
              </div>

              {/* Friends filter button if available */}
              {viewerCanFilterFriends && (
                <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <span>
                      {friendsOnly
                        ? (isHindi ? 'केवल किसान मित्रों की समीक्षाएं' : 'Reviews from your farmer friends')
                        : (isHindi ? 'सभी किसान समीक्षाएं' : 'All farmer reviews')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFriendsOnly((current) => !current)}
                    className="rounded-lg border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    {friendsOnly
                      ? (isHindi ? 'सभी समीक्षाएं देखें' : 'Show all reviews')
                      : (isHindi ? 'मित्रों की समीक्षाएं देखें' : 'Show friend reviews')}
                  </button>
                </div>
              )}

              {/* Reviews List */}
              {visibleReviews.length === 0 ? (
                <p className="py-8 text-center text-gray-500">
                  {friendsOnly
                    ? (isHindi ? 'आपके किसान मित्रों ने अभी तक इस फर्म की समीक्षा नहीं की है।' : 'Your farmer friends have not reviewed this firm yet.')
                    : (isHindi ? 'अभी तक किसी किसान ने इस फर्म की समीक्षा नहीं की है।' : 'No farmers have reviewed this firm yet.')}
                </p>
              ) : (
                <div className="space-y-4">
                  {visibleReviews.map((review) => {
                    const commentText = isHindi && translatedComments[review._id]
                      ? translatedComments[review._id]
                      : review.comment;

                    return (
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
                                  className={`h-4 w-4 ${
                                    value <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <time className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')}
                          </time>
                        </div>
                        {commentText && (
                          <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                            {commentText}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
