import { useState, useEffect, useCallback, useRef } from "react";

export interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    postcode?: string;
    [key: string]: string | undefined;
  };
}

interface UseAddressAutocompleteOptions {
  debounceMs?: number;
}

interface UseAddressAutocompleteReturn {
  suggestions: AddressSuggestion[];
  loading: boolean;
  error: string | null;
  searchAddress: (query: string) => void;
  clearSuggestions: () => void;
  getPlaceDetails: (lat: string, lon: string) => Promise<AddressSuggestion | null>;
}

/**
 * Custom hook for address autocomplete using Nominatim API
 */
export function useAddressAutocomplete(
  options: UseAddressAutocompleteOptions = {}
): UseAddressAutocompleteReturn {
  const { debounceMs = 400 } = options;
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const searchAddress = useCallback(
    (query: string) => {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear suggestions if query is empty
      if (!query.trim()) {
        setSuggestions([]);
        setLoading(false);
        setError(null);
        return;
      }

      // Debounce the search
      debounceTimerRef.current = setTimeout(async () => {
        setLoading(true);
        setError(null);

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        try {
          const encodedQuery = encodeURIComponent(query.trim());
          const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=5`;

          const response = await fetch(url, {
            signal: abortControllerRef.current.signal,
            headers: {
              "User-Agent": "GrantFinder/1.0", // Required by Nominatim
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: AddressSuggestion[] = await response.json();
          setSuggestions(data);
        } catch (err) {
          // Ignore abort errors
          if (err instanceof Error && err.name === "AbortError") {
            return;
          }
          console.error("Error fetching address suggestions:", err);
          setError("Failed to fetch address suggestions");
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  const getPlaceDetails = useCallback(
    async (lat: string, lon: string): Promise<AddressSuggestion | null> => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

        const response = await fetch(url, {
          headers: {
            "User-Agent": "GrantFinder/1.0", // Required by Nominatim
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data as AddressSuggestion;
      } catch (err) {
        console.error("Error fetching place details:", err);
        return null;
      }
    },
    []
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    loading,
    error,
    searchAddress,
    clearSuggestions,
    getPlaceDetails,
  };
}

