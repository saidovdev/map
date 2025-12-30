const socket = io();

/* 🔑 SEN BERGAN TOKEN */
mapboxgl.accessToken =
  "pk.eyJ1IjoidW1lZGpvbjk5IiwiYSI6ImNtN3Rza3czdDB1bW4yanF5Nmg4Ym1nbmIifQ.0Z5e4Qzn8La43ouMfIxaWg";

/* 🗺️ MAPBOX MAP */
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/traffic-day-v2",
  center: [0, 0],
  zoom: 2,
});

/* 🚚 MARKER */
let marker = null;

/* ▶️ START BUTTON */
document.getElementById("start").addEventListener("click", () => {
  if (!navigator.geolocation) {
    console.log("Geolocation not supported");
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      /* 📡 BACKEND GA YUBORISH */
      socket.emit("send-location", {
        latitude,
        longitude,
      });

      /* 📍 MARKER YARATISH / UPDATE */
      if (!marker) {
        marker = new mapboxgl.Marker({ color: "red" })
          .setLngLat([longitude, latitude])
          .addTo(map);
      } else {
        marker.setLngLat([longitude, latitude]);
      }

      /* 🎯 MAP MARKERGA QARAB HARAKATLANADI */
      map.flyTo({
        center: [longitude, latitude],
        zoom: 16,
        speed: 1.2,
      });
    },
    (error) => {
      console.log("GPS error:", error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  );
});
