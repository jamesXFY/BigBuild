import addDisruptionMarker from "../functions/addDisruptionMarker";
import addPlaceMarker from "../functions/addPlaceMarker";

export default function(newMapMarkers, oldMapMarkers, places) {
  let mapMarkers = [];

  newMapMarkers.forEach(marker => {

    // Reuse existing marker if it exists to avoid screen flicker.
    let oldMapMarker;
    if (oldMapMarker = oldMapMarkers.find(oldMarker => oldMarker.id === marker.id)) {
      mapMarkers.push(oldMapMarker);
      oldMapMarkers = oldMapMarkers.filter(oldMarker => oldMarker.id !== marker.id);
      return;
    }

    if (marker.markerType === 'disruption') {
      mapMarkers.push(
        addDisruptionMarker(this, marker.markerDisruption, {
          lat: marker.position.lat(), lng: marker.position.lng()
        })
      );
    }
    else if (marker.markerType === 'place') {
      mapMarkers.push(
        addPlaceMarker(this, marker.markerPlace, marker.markerDisruption, {
          lat: marker.position.lat(), lng: marker.position.lng()
        })
      );
    }

  });

  oldMapMarkers.forEach(marker => {
    marker.setVisible(false);

    // TODO: re-enable when we have some real data to test with.
    // Remove geoJson features.
    // if (marker.markerDisruption && marker.markerDisruption.geometry && marker.markerDisruption.geometry !== 'Point') {
    //   let feature = this.map.data.find(feature => feature.id = marker.markerDisruption.id);
    //   if (feature) {
    //     this.map.remove(feature);
    //   }
    // }
  });

  return mapMarkers;

};
