export default function(app, disruption = false) {
  if (app.disruptions.length === 0){
    return;
  }

  let bounds = new google.maps.LatLngBounds();
  let markersToZoomTo = app.pseudoMarkers;
  if (disruption && disruption.places !== undefined) {
    markersToZoomTo = app.placeMarkers.filter((marker, index) => disruption.places.indexOf(index) !== -1);
  }
  markersToZoomTo.forEach(marker => bounds.extend(marker.getPosition()));
  app.map.fitBounds(bounds);
};
