import Map, {
  GeolocateControl,
  NavigationControl,
  ScaleControl,
  Source,
  Layer,
  MapRef
} from "react-map-gl/mapbox";
import { create } from "zustand";
import { useMemo, useRef, useState, useCallback, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner, useDisclosure } from "@heroui/react";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/react";

import { NotFound } from "@pages";
import { DefaultLayout, PocketBaseContext } from "@components";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const INITIAL_VIEW_STATE = {
  longitude: 106.6975945,
  latitude: 20.8184965,
  zoom: 12
};

const CIRCLE_COLORS = {
  overseer: "green",
  ai: "blue",
  speed: "orange",
  undefined: "grey",
  default: "red",
  cluster: "#8B5CF6"
};

interface SelectedItemState {
  selectedItem: any;
  itemType: "cluster" | "marker" | null;
  setSelectedItem: (item: any, type: "cluster" | "marker" | null) => void;
}

const useSelectedItemStore = create<SelectedItemState>((set) => ({
  selectedItem: null,
  itemType: null,
  setSelectedItem: (item, type) => set({ selectedItem: item, itemType: type })
}));

export default function MapBox() {
  const mapRef = useRef<MapRef>(null);
  const pocketbase = useContext(PocketBaseContext);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [cursor, setCursor] = useState("default");
  const [zoom, setZoom] = useState(INITIAL_VIEW_STATE.zoom);

  const { selectedItem, itemType, setSelectedItem } = useSelectedItemStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const ZOOM_THRESHOLD = 14;

  const clusterQuery = useQuery<any[]>({
    queryKey: ["clusters"],
    queryFn: async () => {
      const clusters = await pocketbase.client.collection("cluster").getFullList();
      return clusters;
    }
  });

  const markerQuery = useQuery<any[]>({
    queryKey: ["markers"],
    queryFn: async () => {
      const markers = await pocketbase.client.collection("marker").getFullList();
      return markers;
    }
  });

  // GeoJSON for clusters
  const clusterGeoJson = useMemo(() => {
    if (!clusterQuery.data) return null;
    return {
      type: "FeatureCollection" as const,
      features: clusterQuery.data.map((cluster) => ({
        type: "Feature" as const,
        properties: { ...cluster, itemType: "cluster", camera_count: 10, direction: parseInt(cluster.direction) },
        geometry: {
          type: "Point" as const,
          coordinates: [parseFloat(cluster.longitude), parseFloat(cluster.latitude)]
        }
      }))
    };
  }, [clusterQuery.data]);

  // GeoJSON for markers
  const markerGeoJson = useMemo(() => {
    if (!markerQuery.data) return null;
    return {
      type: "FeatureCollection" as const,
      features: markerQuery.data.map((marker) => ({
        type: "Feature" as const,
        properties: {
          ...marker,
          itemType: "marker",
          direction: marker.direction ? parseFloat(marker.direction) : 0
        },
        geometry: {
          type: "Point" as const,
          coordinates: [parseFloat(marker.longitude), parseFloat(marker.latitude)]
        }
      }))
    };
  }, [markerQuery.data]);

  const handleMapClick = useCallback((event: any) => {
    const feature = event.features?.[0];
    if (!feature) return;

    const itemType = feature.properties.itemType;

    if (itemType === "cluster") {
      // When clicking a cluster, zoom in to show its markers
      const map = mapRef.current?.getMap();
      if (map) {
        map.easeTo({
          center: feature.geometry.coordinates,
          zoom: ZOOM_THRESHOLD + 2, // Zoom in past the threshold
          duration: 500
        });
      }
    } else if (itemType === "marker") {
      setSelectedItem(feature.properties, "marker");
      onOpen();
    }
  }, [setSelectedItem, onOpen]);

  const handleZoomChange = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      setZoom(map.getZoom());
    }
  }, []);

  // Create and add custom arrow image to the map
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !isMapLoaded) return;

    // Check if image already exists
    if (map.hasImage("direction-arrow")) return;

    // Create a canvas to draw the arrow
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const centerX = size / 2;
      const centerY = size / 2;

      // Draw an arrow pointing upward (0 degrees = North)
      ctx.fillStyle = "#FF0000";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;

      // Draw a more visible arrow/triangle
      ctx.beginPath();
      ctx.moveTo(centerX, size * 0.15); // Top point (pointing up/north)
      ctx.lineTo(centerX - size * 0.25, size * 0.6); // Bottom left
      ctx.lineTo(centerX, size * 0.5); // Middle notch
      ctx.lineTo(centerX + size * 0.25, size * 0.6); // Bottom right
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Add a small circle at the base to show camera position
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Add the image to the map
      map.addImage("direction-arrow", ctx.getImageData(0, 0, size, size));
    }
  }, [isMapLoaded]);

  if (clusterQuery.isLoading || markerQuery.isLoading) return <Spinner />;
  if (clusterQuery.isError || markerQuery.isError || !clusterQuery.data || !markerQuery.data) {
    return <NotFound />;
  }

  return (
    <DefaultLayout>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/standard"
        config={{
          basemap: {
            showPlaceLabels: false,
            showPointOfInterestLabels: false,
            showTransitLabels: false,
            show3dObjects: false,
            showLandmarkIconLabels: false
          }
        }}
        interactiveLayerIds={["cluster-points", "marker-points"]}
        onLoad={() => setIsMapLoaded(true)}
        onZoom={handleZoomChange}
        onZoomEnd={handleZoomChange}
        onClick={handleMapClick}
        onMouseEnter={() => setCursor("pointer")}
        onMouseLeave={() => setCursor("default")}
        cursor={cursor}
      >
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl maxWidth={100} unit="metric" />

        {/* Render Clusters - visible when zoomed out */}
        {isMapLoaded && clusterGeoJson && (
          <Source id="clusters" type="geojson" data={clusterGeoJson}>
            <Layer
              id="cluster-points"
              type="circle"
              paint={{
                "circle-color": CIRCLE_COLORS.cluster,
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  10, 15
                ],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#fff",
                "circle-opacity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  ZOOM_THRESHOLD - 1, 1,
                  ZOOM_THRESHOLD, 0.3,
                  ZOOM_THRESHOLD + 1, 0
                ]
              }}
              layout={{
                "visibility": zoom < ZOOM_THRESHOLD ? "visible" : "none"
              }}
            />
            <Layer
              id="cluster-cameras-count"
              type="symbol"
              layout={{
                "text-field": ["to-string", ["get", "camera_count"]],
                "text-size": 14,
                "text-offset": [0, 0],
                "text-anchor": "center",
                "visibility": zoom < ZOOM_THRESHOLD ? "visible" : "none"
              }}
              paint={{
                "text-color": "#ffffff",
                "text-halo-color": "#000000",
                "text-halo-width": 1,
                "text-opacity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  ZOOM_THRESHOLD - 1, 1,
                  ZOOM_THRESHOLD, 0.3,
                  ZOOM_THRESHOLD + 1, 0
                ]
              }}
            />
            <Layer
              id="cluster-labels"
              type="symbol"
              layout={{
                "text-field": ["get", "title"],
                "text-size": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  10, 12,
                ],
                "text-offset": [0, 2.5],
                "text-anchor": "top",
                "visibility": zoom < ZOOM_THRESHOLD ? "visible" : "none"
              }}
              paint={{
                "text-color": "#ffffff",
                "text-halo-color": "#000000",
                "text-halo-width": 1,
                "text-opacity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  ZOOM_THRESHOLD - 1, 1,
                  ZOOM_THRESHOLD, 0.3,
                  ZOOM_THRESHOLD + 1, 0
                ]
              }}
            />
          </Source>
        )}

        {/* Render Markers - visible when zoomed in */}
        {isMapLoaded && markerGeoJson && (
          <Source id="markers" type="geojson" data={markerGeoJson}>
            <Layer
              id="marker-points"
              type="circle"
              paint={{
                "circle-color": [
                  "match",
                  ["get", "type"],
                  "overseer",
                  CIRCLE_COLORS.overseer,
                  "ai",
                  CIRCLE_COLORS.ai,
                  "speed",
                  CIRCLE_COLORS.speed,
                  "undefined",
                  CIRCLE_COLORS.undefined,
                  CIRCLE_COLORS.default
                ],
                "circle-radius": 8,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#fff",
                "circle-opacity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  ZOOM_THRESHOLD - 1, 0,
                  ZOOM_THRESHOLD, 0.7,
                  ZOOM_THRESHOLD + 1, 1
                ]
              }}
              layout={{
                "visibility": zoom >= ZOOM_THRESHOLD ? "visible" : "none"
              }}
            />
            <Layer
              id="marker-direction"
              type="symbol"
              layout={{
                "icon-image": "direction-arrow",
                "icon-size": 0.7,
                "icon-rotate": ["get", "direction"],
                "icon-rotation-alignment": "map",
                "icon-allow-overlap": true,
                "icon-ignore-placement": true,
                "icon-offset": [0, -5],
                "visibility": zoom >= ZOOM_THRESHOLD ? "visible" : "none"
              }}
              paint={{
                "icon-opacity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  ZOOM_THRESHOLD - 1, 0,
                  ZOOM_THRESHOLD, 0.7,
                  ZOOM_THRESHOLD + 1, 1
                ]
              }}
            />
          </Source>
        )}
      </Map>

      {selectedItem && (
        <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
          <DrawerContent>
            <DrawerHeader>
              {itemType === "cluster" ? "📍 " : "📷 "}
              {selectedItem.title}
            </DrawerHeader>
            <DrawerBody>
              <div className="flex flex-col gap-2">
                {itemType === "marker" && (
                  <>
                    <p><strong>Type:</strong> <span className="uppercase">{selectedItem.type}</span></p>
                    <p><strong>Direction:</strong> {selectedItem.direction}</p>
                  </>
                )}
                <p><strong>Description:</strong> {selectedItem.description}</p>
                <div className="text-sm text-gray-500 mt-2">
                  <p>Lat: {selectedItem.latitude}</p>
                  <p>Lng: {selectedItem.longitude}</p>
                </div>
              </div>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </DefaultLayout>
  );
}