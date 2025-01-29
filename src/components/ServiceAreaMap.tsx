// src/components/ServiceAreaMap.tsx
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import mapboxgl from "mapbox-gl";
import { generateGeoJSON } from "@/lib/regions";
import "mapbox-gl/dist/mapbox-gl.css";
import { Job, JobStatus } from "@/types";
import { fetchJobs } from "@/lib/jobs";
import { EnhancedJobView } from "./jobs/job-card";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export function ServiceAreaMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [scheduledJobs, setScheduledJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const getScheduledJobs = async () => {
      const { jobs, error } = await fetchJobs();
      if (!error) {
        // Filter for scheduled jobs only
        const filtered = jobs.filter(
          (job) =>
            job.status === JobStatus.Scheduled ||
            job.status === JobStatus.ScheduledNextYear
        );
        setScheduledJobs(filtered);
      }
    };

    getScheduledJobs();
  }, []);

  const createMarkerElement = (job: Job) => {
    const el = document.createElement("div");
    el.className = "custom-marker transform-origin-center";
    el.innerHTML = `
      <div class="p-2 bg-white rounded-full shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
    `;

    el.title = `${job.customerName}\n${job.location.address}`;

    el.addEventListener("click", () => {
      setSelectedJob(job);
    });

    return el;
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-111.2224, 32.4364],
      zoom: 10,
    });

    map.current.on("load", () => {
      const geojson = generateGeoJSON();

      map.current?.addSource("service-areas", {
        type: "geojson",
        data: geojson,
      });

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
            "#888888",
          ],
          "fill-opacity": 0.3,
        },
      });

      map.current?.addLayer({
        id: "service-area-outline",
        type: "line",
        source: "service-areas",
        paint: {
          "line-color": "#000",
          "line-width": 2,
        },
      });
    });

    map.current?.on("mousemove", "service-area-fill", (e) => {
      if (e.features?.length) {
        setHoveredRegion(e.features[0].properties?.name || null);
      }
    });

    map.current?.on("mouseleave", "service-area-fill", () => {
      setHoveredRegion(null);
    });

    return () => {
      // Clean up markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !scheduledJobs.length) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for scheduled jobs
    scheduledJobs.forEach((job) => {
      const { lat, lng } = job.location.coordinates;
      if (lat && lng) {
        const marker = new mapboxgl.Marker({
          element: createMarkerElement(job),
          anchor: "center",
          offset: [0, -12],
        })
          .setLngLat([lng, lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      }
    });
  }, [scheduledJobs]);

  return (
    <div style={{ position: "relative" }}>
      {/* The map container */}
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "calc(100vh - 100px)",
          borderRadius: "20px",
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
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-4">
            <EnhancedJobView
              job={selectedJob}
              onEdit={() => {}} // Implement if needed
              onView={() => {}} // Implement if needed
              onClose={() => setSelectedJob(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
