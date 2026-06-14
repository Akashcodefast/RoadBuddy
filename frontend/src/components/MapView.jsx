import { useEffect, useRef } from "react";

const MapView = ({ userLocation, helperLocation }) => {
  const mapRef     = useRef(null);
  const mapObjRef  = useRef(null);
  const userMarker = useRef(null);
  const helpMarker = useRef(null);
  const routeLine  = useRef(null);

  // init map once
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const center = userLocation || { lat: 12.9716, lng: 77.5946 };

    mapObjRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      styles: darkMapStyles,
      disableDefaultUI:  true,
      zoomControl:       true,
    });

    // user marker — red
    if (userLocation) {
      userMarker.current = new window.google.maps.Marker({
        position: userLocation,
        map:      mapObjRef.current,
        title:    "You",
        icon: {
          path:        window.google.maps.SymbolPath.CIRCLE,
          scale:       10,
          fillColor:   "#E8541A",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
    }

  }, []);

  // update user marker
  useEffect(() => {
    if (!mapObjRef.current || !userLocation) return;

    if (userMarker.current) {
      userMarker.current.setPosition(userLocation);
    } else {
      userMarker.current = new window.google.maps.Marker({
        position: userLocation,
        map:      mapObjRef.current,
        icon: {
          path:        window.google.maps.SymbolPath.CIRCLE,
          scale:       10,
          fillColor:   "#E8541A",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
    }

    mapObjRef.current.panTo(userLocation);
  }, [userLocation]);

  // update helper marker + draw route
  useEffect(() => {
    if (!mapObjRef.current || !helperLocation) return;

    if (helpMarker.current) {
      helpMarker.current.setPosition(helperLocation);
    } else {
      helpMarker.current = new window.google.maps.Marker({
        position: helperLocation,
        map:      mapObjRef.current,
        title:    "Helper",
        icon: {
          path:        window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale:       6,
          fillColor:   "#22C55E",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
    }

    // draw dashed route line between user and helper
    if (routeLine.current) routeLine.current.setMap(null);

    if (userLocation) {
      routeLine.current = new window.google.maps.Polyline({
        path:          [helperLocation, userLocation],
        geodesic:      true,
        strokeColor:   "#E8541A",
        strokeOpacity: 0.6,
        strokeWeight:  3,
        icons: [{
          icon:   { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 4 },
          offset: "0",
          repeat: "20px",
        }],
        map: mapObjRef.current,
      });
    }

  }, [helperLocation, userLocation]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl"
      style={{ minHeight: "260px" }}
    />
  );
};

// dark map styles to match app theme
const darkMapStyles = [
  { elementType: "geometry",        stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill",stylers: [{ color: "#8a8a9a" }] },
  { elementType: "labels.text.stroke",stylers:[{ color: "#1a1a2e" }] },
  { featureType: "road",            elementType: "geometry",
    stylers: [{ color: "#2d2d44" }] },
  { featureType: "road",            elementType: "geometry.stroke",
    stylers: [{ color: "#1a1a2e" }] },
  { featureType: "road.highway",    elementType: "geometry",
    stylers: [{ color: "#3d3d5c" }] },
  { featureType: "water",           elementType: "geometry",
    stylers: [{ color: "#0d0d1a" }] },
  { featureType: "poi",             stylers: [{ visibility: "off" }] },
  { featureType: "transit",         stylers: [{ visibility: "off" }] },
];

export default MapView;