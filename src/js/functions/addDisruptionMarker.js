import Vue from 'vue';
import CustomMarker from './customMarker';
import DisruptionInfoWindowComponent from '../components/DisruptionInfoWindow';

export default function(app, disruption, position) {

  if (position === null || position.lat === undefined || position.lng === undefined) {
    return;
  }

  // TODO: re-enable when we have some real data to test with.
  // if (disruption.geometry && disruption.geometry.type && disruption.geometry.type !== 'Point') {
  //   app.map.data.addGeoJson({
  //     type: 'Feature',
  //     geometry: disruption.geometry,
  //     id: disruption.id
  //   }, 'id');
  // }

  let infoWindowClass = Vue.extend(DisruptionInfoWindowComponent);
  let infoWindowComponent = new infoWindowClass({ propsData: { disruption: disruption } });
  infoWindowComponent.$mount();

  CustomMarker.prototype = new google.maps.OverlayView();
  return new CustomMarker(position, app.map, 'disruption' + disruption.id, disruption.typeIcon, infoWindowComponent, (event) => {
    if (!window.matchMedia || !window.matchMedia("(max-width: 1023px)").matches) {
      app.selectedDisruption = disruption;
    }
    app.gaTracking('clicktracking', 'internal-link', 'Map icon (type='+disruption.typeName+', id='+disruption.id+')')
  });

};
