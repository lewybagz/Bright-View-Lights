// src/components/ServiceAreaMap.tsx
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import mapboxgl from "mapbox-gl";
import { generateGeoJSON } from "@/lib/regions";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export function ServiceAreaMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-111.2224, 32.4364], // Center on Marana
      zoom: 10,
    });

    map.current.on("load", () => {
      const geojson = generateGeoJSON();

      // Add service area polygons
      map.current?.addSource("service-areas", {
        type: "geojson",
        data: geojson,
      });

      // Add fill layer
      map.current?.addLayer({
        id: "service-area-fill",
        type: "fill",
        source: "service-areas",
        paint: {
          "fill-color": [
            "match",
            ["get", "name"],
            "Marana",
            "#ff0000",
            "Tucson",
            "#0000ff",
            "Catalina",
            "#00ff00",
            "Vail",
            "#ffff00",
            "Oro Valley",
            "#ff00ff",
            /* default */ "#888888",
          ],
          "fill-opacity": 0.3,
        },
      });

      // Add outline layer
      map.current?.addLayer({
        id: "service-area-outline",
        type: "line",
        source: "service-areas",
        paint: {
          "line-color": "#000",
          "line-width": 2,
        },
      });
      map.current?.on("mousemove", "service-area-fill", (e) => {
        if (e.features?.length) {
          setHoveredRegion(e.features[0].properties?.name || null);
        }
      });

      map.current?.on("mouseleave", "service-area-fill", () => {
        setHoveredRegion(null);
      });
    });

    return () => map.current?.remove();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* The map container */}
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "calc(100vh - 100px)",
          borderRadius: "10px",
        }}
      />

      {/* CHANGED: Framer Motion region label (fade in/out on hover) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: hoveredRegion ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          backgroundColor: "white",
          padding: "8px 12px",
          borderRadius: "4px",
          pointerEvents: "none", // so mouse events pass through
        }}
      >
        {hoveredRegion}
      </motion.div>
    </div>
  );
}
