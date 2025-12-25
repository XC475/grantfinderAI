"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import { parseNominatimAddress, type ParsedAddress } from "@/lib/address-parser";
import { cn } from "@/lib/utils";

export interface AddressAutocompleteProps {
  value?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  onChange: (address: ParsedAddress) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  id?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Start typing your address...",
  className,
  label = "Address",
  id = "address-autocomplete",
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const { suggestions, loading, error, searchAddress, clearSuggestions, getPlaceDetails } =
    useAddressAutocomplete({ debounceMs: 400 });

  // Initialize input value from props on mount
  useEffect(() => {
    if (isInitialMount.current && value) {
      const parts: string[] = [];
      if (value.address) parts.push(value.address);
      if (value.city) parts.push(value.city);
      if (value.state) parts.push(value.state);
      if (value.zipCode) parts.push(value.zipCode);
      setInputValue(parts.join(", "));
      isInitialMount.current = false;
    }
  }, [value]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    if (newValue.trim().length >= 3) {
      searchAddress(newValue);
      setIsOpen(true);
    } else {
      clearSuggestions();
      setIsOpen(false);
    }
  };

  // Handle address selection
  const handleSelectAddress = useCallback(
    async (suggestion: typeof suggestions[0]) => {
      setInputValue(suggestion.display_name);
      setIsOpen(false);
      clearSuggestions();

      // Get detailed place information
      const placeDetails = await getPlaceDetails(suggestion.lat, suggestion.lon);

      if (placeDetails?.address) {
        const parsed = parseNominatimAddress(placeDetails.address);
        onChange(parsed);
      } else if (suggestion.address) {
        // Fallback to suggestion address if reverse geocoding fails
        const parsed = parseNominatimAddress(suggestion.address);
        onChange(parsed);
      }
    },
    [getPlaceDetails, onChange, clearSuggestions]
  );

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectAddress(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        clearSuggestions();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}

      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              role="option"
              aria-selected={index === selectedIndex}
              className={cn(
                "cursor-pointer px-4 py-2 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                index === selectedIndex && "bg-accent text-accent-foreground",
                index === 0 && "rounded-t-md",
                index === suggestions.length - 1 && "rounded-b-md"
              )}
              onClick={() => handleSelectAddress(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {suggestion.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

