import Map, {
  GeolocateControl,
  NavigationControl,
  ScaleControl,
  Source,
  Layer,
  MapRef
} from "react-map-gl/mapbox";
import { create } from "zustand";
import { useMemo, useRef, useState, useCallback, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner, useDisclosure } from "@heroui/react";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/react";

import { NotFound } from "@pages";
import { DefaultLayout, PocketBaseContext } from "@components";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const INITIAL_VIEW_STATE = {
  longitude: 106.6975945,
  latitude: 20.8184965,
  zoom: 20
};

const CLUSTER_CONFIG = {
  maxZoom: 14,
  radius: 50
};

const CIRCLE_COLORS = {
  overseer: "green",
  ai: "blue",
  undefined: "grey",
  default: "red"
};

interface SelectedMarkerState {
  selectedMarker: any;
  setSelectedMarker: (marker: any) => void;
}

const useSelectedMarkerStore = create<SelectedMarkerState>((set) => ({
  selectedMarker: null,
  setSelectedMarker: (marker) => set({ selectedMarker: marker })
}));

export default function MapBox() {
  const mapRef = useRef<MapRef>(null);
  const pocketbase = useContext(PocketBaseContext);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [cursor, setCursor] = useState("default");

  const { selectedMarker, setSelectedMarker } = useSelectedMarkerStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const clusterQuery = useQuery<any[]>({
    queryKey: ["clusters"],
    queryFn: async () => {
      const cameras = await pocketbase.client.collection("cluster").getFullList();
      return cameras;
    }
  });

  const geoJsonData = useMemo(() => {
    if (!clusterQuery.data) return null;
    return {
      type: "FeatureCollection" as const,
      features: clusterQuery.data.map((marker) => ({
        type: "Feature" as const,
        properties: marker,
        geometry: {
          type: "Point" as const,
          coordinates: [marker.longitude, marker.latitude]
        }
      }))
    };
  }, [clusterQuery.data]);

  const handleMapClick = useCallback((event: any) => {
    const feature = event.features?.[0];
    if (!feature) return;

    const clusterId = feature.properties?.cluster_id;

    if (clusterId) {
      const map = mapRef.current?.getMap();
      const source = map?.getSource("cameras") as any;

      source?.getClusterExpansionZoom(
        clusterId,
        (err: Error, zoom: number) => {
          if (err || !map) return;
          map.easeTo({
            center: feature.geometry.coordinates,
            zoom,
            duration: 500
          });
        }
      );
    } else {
      setSelectedMarker(feature.properties);
      onOpen();
    }
  }, [setSelectedMarker, onOpen]);

  if (clusterQuery.isLoading) return <Spinner />;
  if (clusterQuery.isError || !clusterQuery.data) return <NotFound />;

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
        interactiveLayerIds={["clusters", "unclustered-point"]}
        onLoad={() => setIsMapLoaded(true)}
        onClick={handleMapClick}
        onMouseEnter={() => setCursor("pointer")}
        onMouseLeave={() => setCursor("default")}
        cursor={cursor}
      >
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl maxWidth={100} unit="metric" />

        {isMapLoaded && geoJsonData && (
          <Source
            id="cameras"
            type="geojson"
            data={geoJsonData}
            cluster
            clusterMaxZoom={CLUSTER_CONFIG.maxZoom}
            clusterRadius={CLUSTER_CONFIG.radius}
          >
            <Layer
              id="clusters"
              type="circle"
              filter={["has", "point_count"]}
              paint={{
                "circle-color": [
                  "step",
                  ["get", "point_count"],
                  "#51bbd6",
                  100,
                  "#f1f075",
                  750,
                  "#f28cb1"
                ],
                "circle-radius": [
                  "step",
                  ["get", "point_count"],
                  15,
                  100,
                  20,
                  750,
                  25
                ]
              }}
            />

            <Layer
              id="cluster-count"
              type="symbol"
              filter={["has", "point_count"]}
              layout={{
                "text-field": "{point_count_abbreviated}",
                "text-size": 12
              }}
            />

            <Layer
              id="unclustered-point"
              type="circle"
              filter={["!", ["has", "point_count"]]}
              paint={{
                "circle-color": [
                  "match",
                  ["get", "type"],
                  "overseer",
                  CIRCLE_COLORS.overseer,
                  "ai",
                  CIRCLE_COLORS.ai,
                  "undefined",
                  CIRCLE_COLORS.undefined,
                  CIRCLE_COLORS.default
                ],
                "circle-radius": 8,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#fff"
              }}
            />
          </Source>
        )}
      </Map>

      {selectedMarker && (
        <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
          <DrawerContent>
            <DrawerHeader>{selectedMarker.label}</DrawerHeader>
            <DrawerBody>
              <p>Latitude: {selectedMarker.latitude}</p>
              <p>Longitude: {selectedMarker.longitude}</p>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </DefaultLayout>
  );
}