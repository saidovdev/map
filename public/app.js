const socket = io();

/* MAP */
mapboxgl.accessToken =
  "pk.eyJ1IjoidW1lZGpvbjk5IiwiYSI6ImNtN3Rza3czdDB1bW4yanF5Nmg4Ym1nbmIifQ.0Z5e4Qzn8La43ouMfIxaWg";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/traffic-day-v2",
  center: [69.47, 40.16],
  zoom: 13,
});

/* ELEMENTS */
const roleSelect = document.getElementById("roleSelect");
const driverForm = document.getElementById("driverForm");
const mapDiv = document.getElementById("map");

const userBtn = document.getElementById("userBtn");
const driverBtn = document.getElementById("driverBtn");
const startBtn = document.getElementById("startBtn");

/* MARKERS */
const drivers = {};
let myMarker = null;

/* LOCATION */
let lastLocation = null;
let watchId = null;

/* USER */
userBtn.onclick = () => {
  roleSelect.classList.add("hidden");
  mapDiv.style.display = "block";

  map.resize(); // 🔥 MUHIM

  socket.emit("set-role", "user");
};

/* DRIVER */
driverBtn.onclick = () => {
  roleSelect.classList.add("hidden");
  driverForm.classList.remove("hidden");
};

startBtn.onclick = () => {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const busNumber = document.getElementById("busNumber").value;

  if (!name || !phone || !busNumber) {
    alert("Hamma joyni to‘ldir!");
    return;
  }

  driverForm.classList.add("hidden");
  mapDiv.style.display = "block";

  map.resize(); // 🔥 MUHIM

  socket.emit("driver-start", { name, phone, busNumber });

  // 🔴 Agar oldingi watch bo‘lsa, o‘chiramiz
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
  }

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;

      // Agar joy o‘zgarmagan bo‘lsa → yubormaymiz
      if (
        lastLocation &&
        latitude === lastLocation.latitude &&
        longitude === lastLocation.longitude
      ) {
        return;
      }

      lastLocation = { latitude, longitude };

      socket.emit("send-location", { latitude, longitude });

      if (!myMarker) {
        myMarker = new mapboxgl.Marker({ color: "blue" })
          .setLngLat([longitude, latitude])
          .addTo(map);
      } else {
        myMarker.setLngLat([longitude, latitude]);
      }

      map.flyTo({ center: [longitude, latitude], zoom: 15 });
    },
    (err) => {
      console.error("Geolocation error:", err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    }
  );
};

/* INIT DRIVERS */
socket.on("drivers-init", (allDrivers) => {
  Object.entries(allDrivers).forEach(([id, d]) => {
    if (d.latitude && d.longitude) {
      addOrUpdateDriver(id, d);
    }
  });
});

/* DRIVER LOCATION */
socket.on("driver-location", (driver) => {
  addOrUpdateDriver(driver.id, driver);
});

/* REMOVE */
socket.on("driver-disconnected", (id) => {
  if (drivers[id]) {
    drivers[id].remove();
    delete drivers[id];
  }
});

/* FUNCTION */
function addOrUpdateDriver(id, d) {
  const popup = new mapboxgl.Popup().setHTML(`
    <div class="popup">
      <b>🧑‍✈️ ${d.name}</b><br/>
      🚍 ${d.busNumber}<br/>
      📞 ${d.phone}
    </div>
  `);

  if (!drivers[id]) {
    drivers[id] = new mapboxgl.Marker({ color: "red" })
      .setLngLat([d.longitude, d.latitude])
      .setPopup(popup)
      .addTo(map);
  } else {
    drivers[id].setLngLat([d.longitude, d.latitude]);
  }
}
