
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: hospital.geometry.coordinates,
    zoom: 10, // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(hospital.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
            .setHTML(
                    `<h3>${hospital.name}</h3>`
            )
    )
    .addTo(map)