import { useState, useCallback } from 'react';
import { generateRecommendation } from '../features/needle-recommender/RecommendationEngine';
import { useScanContext } from '../context/ScanContext';

/**
 * Hook that wraps the recommendation engine with state management,
 * optional artificial delay for "AI thinking" feel, and history tracking.
 */
export function useRecommendation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setLastRecommendation, addToHistory } = useScanContext();

  const recommend = useCallback(
    async (input) => {
      setLoading(true);
      setError(null);
      setResult(null);

      // Artificial delay to make it feel like the AI is "thinking"
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

      try {
        const rec = generateRecommendation(input);

        if (rec.error) {
          setError(rec.messages.join(', '));
          setLoading(false);
          return null;
        }

        setResult(rec.recommendation);
        setLastRecommendation(rec.recommendation);
        addToHistory({
          ...rec.recommendation,
          input,
        });

        setLoading(false);
        return rec.recommendation;
      } catch (err) {
        setError('Recommendation engine failed: ' + err.message);
        setLoading(false);
        return null;
      }
    },
    [setLastRecommendation, addToHistory]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, recommend, reset };
}
