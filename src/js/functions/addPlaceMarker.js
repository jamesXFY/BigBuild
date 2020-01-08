import Vue from 'vue';
import CustomMarker from "./customMarker";
import PlaceInfoWindowComponent from "../components/PlaceInfoWindow";

export default function(app, place, disruption, position) {

  if (position === null || position.lat === undefined || position.lng === undefined) {
    return;
  }

  let infoWindowClass = Vue.extend(PlaceInfoWindowComponent);
  let infoWindowComponent = new infoWindowClass({
    propsData: {
      disruptions: app.disruptions
      .filter(disruption => disruption.places.indexOf(place.id) !== -1)
      .sort((a, b) => {
        if (a.start_date_full < b.start_date_full) {
          return -1;
        }
        if (a.start_date_full > b.start_date_full) {
          return 1;
        }
        return 0;
      })
    }
  });
  infoWindowComponent.$mount();

  CustomMarker.prototype = new google.maps.OverlayView();
  return new CustomMarker(position, app.map, 'place' + place.id, disruption.typeIcon, infoWindowComponent, (event) => {
    if (!window.matchMedia || !window.matchMedia("(max-width: 1023px)").matches) {
      let thisDisruptions = app.placeDisruptions[place.id]
      if (thisDisruptions.indexOf(",") > 0) {
        app.$store.commit('resetMarkers', false)
        app.selectedPlace = place;
      } else {
        Vue.set(app.$store.state.urlParams, 'place', place.id)
        app.selectedDisruption = disruption;
        //app.selectedPlace = place;
      }
    }
    app.gaTracking('clicktracking', 'internal-link', 'Map icon (type='+disruption.typeName+', id='+place.id+')')
  });

};
