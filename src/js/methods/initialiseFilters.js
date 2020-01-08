// import jQuery from "jquery";
import MarkerClusterer from "marker-clusterer-plus";

export default function() {
  const itemsUrls = [
    disruptionsAPIEndpoint + "/icons/",
    disruptionsAPIEndpoint + "/types/",
    disruptionsAPIEndpoint + "/projects/?current=True",
    disruptionsAPIEndpoint + "/places/",
    disruptionsAPIEndpoint + "/detours/"
  ];

  const fetchJSON = url =>
    new Promise((resolve, reject) => {
      jQuery.getJSON(url)
        .done(json => resolve(json))
        .fail((xhr, status, err) => reject(status + err.message))
    });

  const itemPromises = itemsUrls.map(fetchJSON)

  Promise.all(itemPromises)
    .then((results) => {

      const apiIcons = results[0];
      const apiTypes = results[1];
      const apiProjects = results[2];
      const apiPlaces = results[3];
      const apiDetours = results[4];

      if (!(apiTypes instanceof Array)) {
        return;
      }

      apiIcons.forEach(icon => {
        this.icons.push({
          id: icon.id,
          name: icon.name,
          url: icon.icon,
          colour: icon.icon_colour,
          rgbColour: icon.icon_colour.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
            ,(m, r, g, b) => '#' + r + r + g + g + b + b)
            .substring(1).match(/.{2}/g)
            .map(x => parseInt(x, 16))
        });
      });

      this.types = apiTypes
        .filter((type) => type.id !== null && type.icon !== null)
        .map((type) => {
          let iconId = parseInt(type.icon.match(/\d+/)[0]);
          let icon = this.icons.find(icon => icon.id === iconId);
          return {
            'id': type.id,
            'value': type.id,
            'label': type.name,
            'icon': icon
          }
        })
        .sort((a, b) => {
          return a.label > b.label;
        });

      this.projects = apiProjects.map(project => {
        return {
          'value': project.id,
          'label': project.name
        }
      }).sort((a, b) => {
        return a.label > b.label;
      });

      this.places = apiPlaces.map(place => {
        return {
          'id': place.id,
          'label': place.name,
          'geometry': place.location,
          'icon': place.icon
        };
      });

      this.detours = apiDetours.map(detour => {
        return {
          'id': detour.id,
          'label': detour.name,
          'description': detour.description,
          'instructions': detour.instructions,
          'status': detour.status,
          'disruptions': detour.disruptions
        };
      })

  }).then(() => {
    this.urlParamsUpdated();
  }).then(() => {
    this.filtersInitialised = true;
  }).then(() => {
    this.updateDisruptions();
  });

};
