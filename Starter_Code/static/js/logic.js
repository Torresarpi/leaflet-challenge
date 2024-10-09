// Define your map object
const map = L.map('map').setView([20, 0], 2); // Initial map view

// Add tile layer to the map (basic OpenStreetMap layer)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to scale marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 4;
}

// Function to determine marker color based on earthquake depth
function markerColor(depth) {
    return depth > 90 ? "#ff0000" :
           depth > 70 ? "#ff6600" :
           depth > 50 ? "#ffcc00" :
           depth > 30 ? "#ffff00" :
           depth > 10 ? "#ccff33" :
                        "#33ff33";
}

// Fetch earthquake data from USGS (7-day dataset)
fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
    .then(response => response.json())
    .then(data => {
        // For each earthquake, create a circle marker
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: markerSize(feature.properties.mag),
                    fillColor: markerColor(feature.geometry.coordinates[2]),
                    color: "#000",
                    weight: 1,
                    fillOpacity: 0.8
                });
            },
            onEachFeature: function (feature, layer) {
                // Popup for each earthquake with magnitude and location
                layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3>
                                 <hr><p>Magnitude: ${feature.properties.mag}</p>
                                 <p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
            }
        }).addTo(map);
    });

// Add a legend to the map
const legend = L.control({ position: "bottomright" });
legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    const depths = [0, 10, 30, 50, 70, 90];
    const colors = [
        "#33ff33",
        "#ccff33",
        "#ffff00",
        "#ffcc00",
        "#ff6600",
        "#ff0000"
    ];

    div.innerHTML += "<strong>Depth (km)</strong><br>";

    // Loop through depth intervals to generate label
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
    }

    return div;
};
legend.addTo(map);
