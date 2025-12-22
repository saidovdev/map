const socket = io();

const map = L.map("map").setView([0, 0], 2); // boshlang'ich dunyo ko'rinishi

L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 19,
  subdomains: ["a", "b", "c"]
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
        enableHighAccuracy: true,
        timeout: 15000, // 15 sekund
        maximumAge: 0
      }
    );
  } else {
    console.log("Geolocation not supported");
  }
});
