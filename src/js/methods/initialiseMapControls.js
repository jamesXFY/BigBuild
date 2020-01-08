import zoomToFit from './../functions/zoomToFit.js';

export default function() {

  // On first load, add listener for zoom/drag events.
  google.maps.event.addListenerOnce(this.map, 'idle', () => {
    google.maps.event.addListener(this.map, 'idle', () => {
      this.mapBounds = [
        this.map.getBounds().getNorthEast().lng(),
        this.map.getBounds().getNorthEast().lat(),
        this.map.getBounds().getSouthWest().lng(),
        this.map.getBounds().getSouthWest().lat()
      ];
    });
  });

  let controlDiv = document.createElement('div');
  controlDiv.className = 'controlMap';
  controlDiv.style.padding = '15px';

  let resetButton = document.createElement('div');
  resetButton.className = 'controlButton resetButton';
  resetButton.innerHTML = '<span class="icon-reset"></span>';
  controlDiv.appendChild(resetButton);

  let infoButton = document.createElement('div');
  infoButton.className = 'controlButton infoButton';
  infoButton.innerHTML = '<span class="icon-information"></span>';
  controlDiv.appendChild(infoButton);

  let zoomInButton = document.createElement('div');
  zoomInButton.className = 'controlButton zoomInButton';
  zoomInButton.innerHTML = '<span></span>';
  controlDiv.appendChild(zoomInButton);

  let zoomOutButton = document.createElement('div');
  zoomOutButton.className = 'controlButton zoomOutButton';
  zoomOutButton.innerHTML = '<span></span>';
  controlDiv.appendChild(zoomOutButton);

  google.maps.event.addDomListener(zoomInButton, 'click', () => {
    this.map.setZoom(this.map.getZoom() + 1);
  });

  google.maps.event.addDomListener(zoomOutButton, 'click', () => {
    this.map.setZoom(this.map.getZoom() - 1);
  });

  google.maps.event.addDomListener(infoButton, 'click', () => {
    this.showOnboarding = true;
  });

  google.maps.event.addDomListener(resetButton, 'click', () => {
    this.clearFilters();
    zoomToFit(this);
  });

  controlDiv.index = 1;
  this.map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(controlDiv);
}
