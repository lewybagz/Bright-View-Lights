// components/AddressAutocomplete.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import { Control, FieldErrors, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { JobFormData } from "@/lib/schemas/job-schema";
import { useGoogleMaps } from "@/hooks/use-google-maps";

interface AddressAutocompleteProps {
  control: Control<JobFormData>;
  errors: FieldErrors<JobFormData>;
  onAddressSelect?: (address: string) => void;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  control,
  errors,
  onAddressSelect,
}) => {
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const elementRef = useRef<HTMLInputElement>(null);
  const [formLoading, setFormLoading] = useState(false);
  const {
    isLoaded,
    isLoading: mapsLoading,
    error,
  } = useGoogleMaps(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "");

  // Handle place selection
  const handlePlaceChanged = useMemo(() => {
    return debounce(() => {
      if (autocomplete) {
        const place = autocomplete.getPlace();
        if (place?.formatted_address) {
          onAddressSelect?.(place.formatted_address);
        }
      }
    }, 300);
  }, [autocomplete, onAddressSelect]);

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !elementRef.current || autocomplete) return;
    setFormLoading(true);

    try {
      const autoCompleteInstance = new google.maps.places.Autocomplete(
        elementRef.current,
        {
          types: ["address"],
        }
      );

      autoCompleteInstance.addListener("place_changed", handlePlaceChanged);
      setAutocomplete(autoCompleteInstance);
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
    } finally {
      setFormLoading(false);
    }

    // Cleanup listeners on unmount
    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
      handlePlaceChanged.cancel();
    };
  }, [isLoaded, handlePlaceChanged, autocomplete]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    };

    const inputElement = elementRef.current;
    if (inputElement) {
      inputElement.addEventListener("keydown", handleKeyDown);
      return () => {
        inputElement.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);

  if (error) {
    return <div>Error loading Google Maps</div>;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="address">Address</Label>
      {mapsLoading && <span>Loading address autocomplete...</span>}
      <Controller
        name="location.address"
        control={control}
        defaultValue=""
        render={({ field: { ref, ...field } }) => (
          <Input
            {...field}
            value={field.value || ""}
            // We use regular ref for our elementRef
            ref={elementRef}
            // And pass the form's ref as a separate prop
            inputRef={ref}
            aria-label="Search for an address"
            aria-describedby="address-hint"
            role="combobox"
            aria-expanded="false"
            aria-autocomplete="list"
            placeholder="Start typing your address..."
            disabled={mapsLoading || formLoading}
          />
        )}
      />
      <div id="address-hint" className="sr-only">
        Start typing to search for an address. Use arrow keys to navigate
        suggestions.
      </div>
      {errors.location?.address && (
        <p className="text-sm text-red-500" role="alert">
          {errors.location.address.message}
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete;
