// components/AddressAutocomplete.tsx
import React, { useState, useRef, useEffect } from "react";
import { Control, FieldErrors, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { JobFormData } from "@/lib/schemas/job-schema";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import { JobLocation } from "@/types";
import { determineLocationTag } from "@/lib/regions";

interface AddressAutocompleteProps {
  control: Control<JobFormData>;
  errors: FieldErrors<JobFormData>;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  control,
  errors,
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
  const [selectedLocation, setSelectedLocation] = useState<JobLocation | null>(
    null
  );

  const fieldOnChangeRef = useRef<((value: JobLocation) => void) | null>(null);

  // Handle place selection
  useEffect(() => {
    if (!isLoaded || !elementRef.current || autocomplete) return;
    setFormLoading(true);

    try {
      const autoCompleteInstance = new google.maps.places.Autocomplete(
        elementRef.current,
        { types: ["address"] }
      );

      console.log("Autocomplete instance created");

      // Use autoCompleteInstance directly instead of the state variable
      const handlePlaceChanged = () => {
        console.log("Place Changed Event");
        // Use autoCompleteInstance instead of autocomplete
        const place = autoCompleteInstance.getPlace();
        console.log("Selected place:", place);

        if (place?.formatted_address && place.geometry?.location) {
          // First, create the coordinates object
          const coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          // Use determineLocationTag to get the correct tag based on the coordinates
          const location: JobLocation = {
            address: place.formatted_address,
            coordinates,
            tag: determineLocationTag(coordinates), // This replaces the hardcoded "in-town"
          };

          console.log("Setting location:", location);
          setSelectedLocation(location);
          fieldOnChangeRef.current?.(location);
        }
      };

      autoCompleteInstance.addListener("place_changed", handlePlaceChanged);
      setAutocomplete(autoCompleteInstance);
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
    } finally {
      setFormLoading(false);
    }

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [autocomplete, isLoaded]); // Note: removed autocomplete from dependencies

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

  useEffect(() => {
    console.log("Selected Location Updated:", selectedLocation);
  }, [selectedLocation]);

  if (error) {
    return <div>Error loading Google Maps</div>;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="address">Address</Label>
      <Controller
        name="location"
        control={control}
        defaultValue={{
          address: "",
          coordinates: { lat: 0, lng: 0 },
          tag: "out-of-town",
        }}
        render={({ field }) => {
          fieldOnChangeRef.current = field.onChange;

          return (
            <Input
              {...field}
              value={selectedLocation?.address || field.value.address || ""}
              ref={elementRef}
              onChange={(e) => {
                // Only update form if no selected location
                console.log("Input Change Event:", e.target.value);
                if (!selectedLocation) {
                  field.onChange({
                    ...field.value,
                    address: e.target.value,
                  });
                }
              }}
              onFocus={() => {
                setSelectedLocation(null);
              }}
              aria-label="Search for an address"
              aria-describedby="address-hint"
              role="combobox"
              aria-expanded="false"
              aria-autocomplete="list"
              placeholder="Start typing your address..."
              disabled={mapsLoading || formLoading}
            />
          );
        }}
      />
      {errors.location?.address && (
        <p className="text-sm text-red-500" role="alert">
          {errors.location.address.message}
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete;
