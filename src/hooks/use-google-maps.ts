// hooks/useGoogleMaps.ts
import { useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface GoogleMapsState {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
}

let loader: Loader | null = null;

const getLoader = (apiKey: string) => {
  if (!loader) {
    loader = new Loader({
      apiKey,
      libraries: ["places"],
      version: "weekly",
    });
  }
  return loader;
};

export const useGoogleMaps = (apiKey: string) => {
  const [state, setState] = useState<GoogleMapsState>({
    isLoaded: !!window.google?.maps,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!apiKey) {
      setState({ isLoaded: false, isLoading: false, error: new Error('API key is required') });
      return;
    }

    if (state.isLoaded) return;

    setState(prev => ({ ...prev, isLoading: true }));

    getLoader(apiKey)
      .load()
      .then(() => {
        setState({ isLoaded: true, isLoading: false, error: null });
      })
      .catch((error) => {
        setState({ isLoaded: false, isLoading: false, error });
      });
  }, [apiKey, state.isLoaded]);

  return state;
};