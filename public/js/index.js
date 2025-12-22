const socket = io();

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
  maxZoom: 19
}).addTo(map);

let marker;

document.getElementById("start").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        socket.emit("send-location", { latitude, longitude });

        if (!marker) {
          marker = L.marker([latitude, longitude]).addTo(map);
        } else {
          marker.setLatLng([latitude, longitude]);
        }

        map.setView([latitude, longitude], 16);
      },
      (error) => {
        console.log("GPS error:", error.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }
});
