import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export type UseAutocompleteSuggestionsReturn = {
  suggestions: google.maps.places.AutocompleteSuggestion[];
  isLoading: boolean;
  resetSession: () => void;
};

// Naples bias bounds to prioritize local streets and landmarks
const NAPLES_BIAS_BOUNDS = {
  north: 40.915,
  south: 40.785,
  east: 14.345,
  west: 14.155,
};

export function useAutocompleteSuggestions(
  inputString: string,
  enabled: boolean = true
): UseAutocompleteSuggestionsReturn {
  const placesLib = useMapsLibrary('places');
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!placesLib || !enabled) return;

    const trimmed = inputString.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const request: google.maps.places.AutocompleteRequest = {
          input: trimmed,
          sessionToken: sessionTokenRef.current ?? undefined,
          locationBias: NAPLES_BIAS_BOUNDS,
          includedRegionCodes: ['it'],
        };
        const res = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        if (!cancelled) {
          setSuggestions(res.suggestions ?? []);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setSuggestions([]);
          const msg = err instanceof Error ? err.message : String(err);
          if (
            msg.includes('RESOURCE_EXHAUSTED') ||
            msg.includes('OVER_QUERY_LIMIT') ||
            msg.includes('429')
          ) {
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 260);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [placesLib, inputString, enabled]);

  return {
    suggestions,
    isLoading,
    resetSession: () => {
      sessionTokenRef.current = null;
      setSuggestions([]);
    },
  };
}
