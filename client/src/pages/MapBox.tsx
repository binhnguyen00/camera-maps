import Map, {
  GeolocateControl,
  NavigationControl,
  ScaleControl,
  Marker,
  Popup
} from "react-map-gl/mapbox";
import { create } from "zustand";
import { useQuery } from "@tanstack/react-query";
import { Spinner, Button, useDisclosure } from "@heroui/react";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/react";

import { NotFound } from "@pages";
import { DefaultLayout } from "@components";
import markersSample from "@/sample/markers.json";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const INITIAL_VIEW_STATE = {
  longitude: 106.6975945,
  latitude: 20.8184965,
  zoom: 20
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
  const { selectedMarker, setSelectedMarker } = useSelectedMarkerStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const query = useQuery<any[]>({
    queryKey: ["cameras"],
    queryFn: async () => {
      return markersSample as any[];
    }
  });

  if (query.isLoading) {
    return <Spinner />
  }

  if (query.isError) {
    return <NotFound />
  }

  if (!query.data) {
    return <p> {query.error} </p>
  }

  return (
    <DefaultLayout>
      <Map
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        initialViewState={INITIAL_VIEW_STATE}
        style={{
          width: "100vw",
          height: "100vh"
        }}
        mapStyle="mapbox://styles/mapbox/standard"
      >
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl maxWidth={100} unit="metric" />

        {query.data.map((marker) => {
          let color = "red";
          if (marker.type === "overseer") {
            color = "green"
          } else if (marker.type === "ai") {
            color = "blue"
          } else if (marker.type === "undefined") {
            color = "grey"
          }
          return (
            <Marker
              key={marker.id}
              longitude={marker.longitude}
              latitude={marker.latitude}
              color={color}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedMarker(marker);
                onOpen();
              }}
            />
          )
        })}
      </Map>

      {selectedMarker && (
        <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
          <DrawerContent>
            <DrawerHeader>
              {selectedMarker.label}
            </DrawerHeader>
            <DrawerBody>
              {selectedMarker.longitude}
              {selectedMarker.latitude}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </DefaultLayout>
  );
}