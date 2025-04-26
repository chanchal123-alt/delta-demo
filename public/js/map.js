maplibregl.accessToken = mapToken;  // not mandatory for MapLibre if token is in URL

const map = new maplibregl.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/streets/style.json?key=${mapToken}`,
    center: coordinates,
    zoom: 9
});

new maplibregl.Marker()
    .setLngLat(coordinates)
    .setPopup(
        new maplibregl.Popup({ offset: 25 })
        .setHTML(`<h5>${listingTitle}</h5>`)
    )
    .addTo(map);
