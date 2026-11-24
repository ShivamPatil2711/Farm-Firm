import { useEffect, useState } from 'react';
import { Star, Languages, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import FirmReviewsModal from './FirmReviewsModal';
import { translateToHindi, translateListToHindi } from '../lib/translator';

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4003';

export default function FirmReviewsSection({ firm }) {
  const [summary, setSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [aiSummary, setAiSummary] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [summaryLang, setSummaryLang] = useState('en'); // 'en' | 'hi'
  const [isTranslating, setIsTranslating] = useState(false);
  const [dynamicHindi, setDynamicHindi] = useState(null);

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
          if (aiData.available) {
            setAiSummary(aiData.summary);
            // Pre-seed dynamicHindi if backend provided summary_hi
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
        toast.error(error.message);
      }
    };

    if (firm?._id) fetchSummary();
  }, [firm?._id]);

  // Handle switching to Hindi: if not already translated, translate on the fly
  const handleLanguageChange = async (lang) => {
    setSummaryLang(lang);
    if (lang === 'hi' && !dynamicHindi && aiSummary) {
      // Check if backend already has summary_hi
      if (aiSummary.summary_hi) {
        setDynamicHindi({
          summary: aiSummary.summary_hi,
          positives: aiSummary.positivePoints_hi || [],
          concerns: aiSummary.concerns_hi || []
        });
        return;
      }

      // Translate dynamically using translator utility
      setIsTranslating(true);
      try {
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
      } catch (e) {
        console.error('Translation error:', e);
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
            {/* Header with Title and Prominent Language Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-gray-900">
                  {isHindi ? 'AI समीक्षा सारांश' : 'AI-powered review summary'}
                </span>
                {isTranslating && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-700 animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    अनुवाद हो रहा है...
                  </span>
                )}
              </div>

              {/* Language Toggle Button */}
              <div className="inline-flex items-center rounded-lg border border-amber-300 bg-white p-0.5 text-xs font-medium shadow-xs">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`flex items-center gap-1 rounded-md px-3 py-1 font-semibold transition-all ${
                    !isHindi
                      ? 'bg-amber-500 text-white shadow-xs'
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
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  aria-pressed={isHindi}
                >
                  🇮🇳 हिन्दी
                </button>
              </div>
            </div>

            {/* Summary Content */}
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
          </div>
        )}
      </section>

      {showReviews && (
        <FirmReviewsModal
          firm={firm}
          initialLang={summaryLang}
          onClose={() => setShowReviews(false)}
        />
      )}
    </>
  );
}
