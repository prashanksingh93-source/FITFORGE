import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import socket from "../services/socket";

mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_TOKEN;

const LiveDeliveryMap = ({
  orderId,
  isDriver = false,
}) => {
  const mapContainerRef =
    useRef(null);

  const mapRef = useRef(null);

  const markerRef =
    useRef(null);

  const watchIdRef =
    useRef(null);

  const [location, setLocation] =
    useState(null);

  const [tracking, setTracking] =
    useState(false);

  const [trackingStarted, setTrackingStarted] =
    useState(false);

  const [deliveryCompleted, setDeliveryCompleted] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Default map location
  |--------------------------------------------------------------------------
  */

  const defaultLocation = [
    78.0081,
    27.1767,
  ];

  /*
  |--------------------------------------------------------------------------
  | Create Mapbox map
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    if (!mapboxgl.accessToken) {
      setError(
        "Mapbox token is missing. Add VITE_MAPBOX_TOKEN to your .env file."
      );

      return;
    }

    const map = new mapboxgl.Map({
      container:
        mapContainerRef.current,

      style:
        "mapbox://styles/mapbox/standard",

      center: defaultLocation,

      zoom: 12,
    });

    map.addControl(
      new mapboxgl.NavigationControl(),
      "top-right"
    );

    mapRef.current = map;

    return () => {
      if (
        watchIdRef.current !== null
      ) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );

        watchIdRef.current = null;
      }

      if (markerRef.current) {
        markerRef.current.remove();

        markerRef.current = null;
      }

      if (mapRef.current) {
        mapRef.current.remove();

        mapRef.current = null;
      }
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Update Mapbox marker
  |--------------------------------------------------------------------------
  */

  const updateMarker = (
    longitude,
    latitude
  ) => {
    if (!mapRef.current) {
      return;
    }

    const coordinates = [
      longitude,
      latitude,
    ];

    if (!markerRef.current) {
      markerRef.current =
        new mapboxgl.Marker({
          color: "#111827",
        })
          .setLngLat(coordinates)
          .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat(
        coordinates
      );
    }

    mapRef.current.flyTo({
      center: coordinates,
      zoom: 15,
      essential: true,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Join order room and receive driver location
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!orderId) {
      return;
    }

    /*
    | Join order room
    */

    socket.emit("join-order", {
      orderId,
    });

    console.log(
      "📦 Joined order:",
      orderId
    );

    /*
    | Tracking started
    */

    const handleTrackingStarted = (
      data
    ) => {
      console.log(
        "🚚 Tracking started:",
        data
      );

      if (
        String(data.orderId) ===
        String(orderId)
      ) {
        setTrackingStarted(true);
      }
    };

    /*
    | Receive driver location
    */

    const handleLocationUpdate = (
      data
    ) => {
      console.log(
        "📍 Received driver location:",
        data
      );

      if (
        String(data.orderId) !==
        String(orderId)
      ) {
        return;
      }

      setLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        heading: data.heading,
        speed: data.speed,
      });

      /*
      | Only customer needs to receive
      | driver's location.
      */

      if (!isDriver) {
        updateMarker(
          data.longitude,
          data.latitude
        );
      }
    };

    /*
    | Delivery completed
    */

    const handleDeliveryCompleted = (
      data
    ) => {
      console.log(
        "✅ Delivery completed:",
        data
      );

      if (
        String(data.orderId) ===
        String(orderId)
      ) {
        setDeliveryCompleted(true);
        setTracking(false);
      }
    };

    socket.on(
      "tracking-started",
      handleTrackingStarted
    );

    socket.on(
      "location-update",
      handleLocationUpdate
    );

    socket.on(
      "delivery-completed",
      handleDeliveryCompleted
    );

    return () => {
      socket.off(
        "tracking-started",
        handleTrackingStarted
      );

      socket.off(
        "location-update",
        handleLocationUpdate
      );

      socket.off(
        "delivery-completed",
        handleDeliveryCompleted
      );
    };
  }, [orderId, isDriver]);

  /*
  |--------------------------------------------------------------------------
  | Start GPS tracking
  |--------------------------------------------------------------------------
  */

  const startTracking = () => {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    if (!orderId) {
      setError(
        "Order ID is missing."
      );

      return;
    }

    /*
    | Tell backend that tracking started
    */

    socket.emit(
      "start-delivery-tracking",
      {
        orderId,
      }
    );

    setTracking(true);

    /*
    | Start watching GPS
    */

    watchIdRef.current =
      navigator.geolocation.watchPosition(
        (position) => {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const accuracy =
            position.coords.accuracy;

          const heading =
            position.coords.heading;

          const speed =
            position.coords.speed;

          /*
          | Update local state
          */

          setLocation({
            latitude,
            longitude,
            accuracy,
            heading,
            speed,
          });

          /*
          | Update driver's own map
          */

          updateMarker(
            longitude,
            latitude
          );

          /*
          | Send GPS to backend
          */

          socket.emit(
            "delivery-location",
            {
              orderId,
              latitude,
              longitude,
              accuracy,
              heading,
              speed,
            }
          );

          console.log(
            "📤 Sent driver location:",
            {
              orderId,
              latitude,
              longitude,
            }
          );
        },

        (geoError) => {
          console.error(
            "GPS error:",
            geoError
          );

          setTracking(false);

          if (geoError.code === 1) {
            setError(
              "Location permission was denied. Please allow location access."
            );
          } else if (
            geoError.code === 2
          ) {
            setError(
              "Your location could not be determined."
            );
          } else if (
            geoError.code === 3
          ) {
            setError(
              "Location request timed out."
            );
          } else {
            setError(
              "Unable to get your location."
            );
          }
        },

        {
          enableHighAccuracy: true,

          maximumAge: 5000,

          timeout: 10000,
        }
      );
  };

  /*
  |--------------------------------------------------------------------------
  | Stop GPS tracking
  |--------------------------------------------------------------------------
  */

  const stopTracking = () => {
    if (
      watchIdRef.current !== null
    ) {
      navigator.geolocation.clearWatch(
        watchIdRef.current
      );

      watchIdRef.current = null;
    }

    setTracking(false);

    console.log(
      "🛑 Driver location tracking stopped"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Complete delivery
  |--------------------------------------------------------------------------
  */

  const completeDelivery = () => {
    if (!orderId) {
      return;
    }

    stopTracking();

    socket.emit(
      "delivery-completed",
      {
        orderId,
      }
    );

    setDeliveryCompleted(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Center map on location
  |--------------------------------------------------------------------------
  */

  const centerLocation = () => {
    if (
      !location ||
      !mapRef.current
    ) {
      return;
    }

    mapRef.current.flyTo({
      center: [
        location.longitude,
        location.latitude,
      ],

      zoom: 16,

      essential: true,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="w-full">

      {/* Header / Status */}

      <div className="mb-4 rounded-xl border bg-white p-4">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-xl font-bold">
              {isDriver
                ? "Delivery Tracking"
                : "Live Delivery"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Order #{orderId}
            </p>
          </div>

          <div className="flex items-center gap-2">

            <span
              className={`h-3 w-3 rounded-full ${
                tracking ||
                trackingStarted
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />

            <span className="text-sm font-medium">

              {deliveryCompleted
                ? "Delivery Completed"
                : tracking
                ? "Location Sharing ON"
                : trackingStarted
                ? "Tracking Active"
                : "Waiting for Delivery Partner"}

            </span>

          </div>

        </div>

        {/* Error */}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Location information */}

        {location && (
          <div className="mt-4 grid gap-3 rounded-lg bg-gray-50 p-3 text-sm md:grid-cols-2">

            <div>
              <strong>
                Latitude:
              </strong>{" "}
              {location.latitude.toFixed(
                6
              )}
            </div>

            <div>
              <strong>
                Longitude:
              </strong>{" "}
              {location.longitude.toFixed(
                6
              )}
            </div>

            {location.accuracy && (
              <div>
                <strong>
                  Accuracy:
                </strong>{" "}
                {Math.round(
                  location.accuracy
                )}
                m
              </div>
            )}

            {location.speed !== null &&
              location.speed !== undefined && (
                <div>
                  <strong>
                    Speed:
                  </strong>{" "}
                  {location.speed > 0
                    ? `${(
                        location.speed *
                        3.6
                      ).toFixed(1)} km/h`
                    : "0 km/h"}
                </div>
              )}

          </div>
        )}

        {/* Driver controls */}

        {isDriver && (
          <div className="mt-4 flex flex-wrap gap-3">

            {!tracking ? (
              <button
                onClick={
                  startTracking
                }
                disabled={
                  deliveryCompleted
                }
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start Live Location
              </button>
            ) : (
              <button
                onClick={
                  stopTracking
                }
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Stop Live Location
              </button>
            )}

            <button
              onClick={
                centerLocation
              }
              disabled={!location}
              className="rounded-lg border px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Center My Location
            </button>

            <button
              onClick={
                completeDelivery
              }
              disabled={
                deliveryCompleted
              }
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Complete Delivery
            </button>

          </div>
        )}

      </div>

      {/* Map */}

      <div
        ref={
          mapContainerRef
        }
        className="h-[500px] w-full overflow-hidden rounded-2xl"
      />

    </div>
  );
};

export default LiveDeliveryMap;