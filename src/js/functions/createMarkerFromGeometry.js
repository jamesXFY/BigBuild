import centroid from '@turf/centroid';
import center from '@turf/center';
import nearestPointOnLine from '@turf/nearest-point-on-line';

export default function(geometry) {

  if (geometry === null || geometry == undefined) {
    return null;
  }

  if (geometry.type === 'Point') {
    return {
      lat: parseFloat(geometry.coordinates[1]),
      lng: parseFloat(geometry.coordinates[0])
    };
  }

  if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
    let centrePoint = null;
    let nearestCentrePointOnLine = null;
    try {
      centrePoint = center(geometry);
      nearestCentrePointOnLine = nearestPointOnLine(geometry, centrePoint);
    } catch (e) {}
    if (nearestCentrePointOnLine.geometry.coordinates !== undefined) {
      return {
        lat: nearestCentrePointOnLine.geometry.coordinates[1],
        lng: nearestCentrePointOnLine.geometry.coordinates[0]
      }
    }
  }

  if (geometry.type === 'Polygon') {
    let centrePoint = null;
    try {
      centrePoint = centroid(geometry);
    } catch (e) {}
    if (centrePoint.geometry.coordinates !== undefined) {
      return {
        lat: centrePoint.geometry.coordinates[1],
        lng: centrePoint.geometry.coordinates[0]
      }
    }
  }

  return null;
};
