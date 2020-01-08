function CustomMarker(latlng, map, id, icon, infoWindowComponent, onClick) {
  this.div = null;
  this.id = id;
  this.icon = icon;
  this.infoWindowComponent = infoWindowComponent;

  let position = new google.maps.LatLng(latlng.lat, latlng.lng);
  this.setMap(map);

  if (!this.div) {
    this.div = document.createElement('div');
    this.div.className = 'customDisruptionMarker icon' + this.icon.id;
    this.div.style.position = 'absolute';
    this.div.style.backgroundImage = "url('" + this.icon.url + "')";
    this.div.style.backgroundColor = this.icon.colour;

    let panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this.div);

    google.maps.event.addDomListener(this.div, 'mousedown', onClick);
    google.maps.event.addDomListener(this.div, 'touchstart', onClick);
  }

  this.draw = () => {
    if (this.div) {
      let positionPixel = this.getProjection().fromLatLngToDivPixel(position);
      this.div.style.left = positionPixel.x + 'px';
      this.div.style.top = positionPixel.y + 'px';
    }
  };

  this.setVisible = (visible) => {
    if (this.div) {
      this.div.style.visibility = (visible) ? 'visible' : 'hidden'
    }
  };

  this.setHovered = (hovered, zIndex = null) => {
    if (this.div) {
      if (hovered) {
        if (this.div.className.indexOf('hovered') < 0) { this.div.className += ' hovered active' }
      } else {
        this.div.classList.remove('hovered');
        this.div.classList.remove('active');
      }
      // this.div.className = (hovered) ? this.div.className += ' hovered active' : this.div.className.replace(/[ ]?hovered active/);
      if (zIndex) {
        this.div.style.zIndex = zIndex;
      }
    }
  };

  this.getPosition = () => (latlng);
}

export default CustomMarker;
