import format from 'date-fns/format';
import addDays from 'date-fns/add_days';
// import jQuery from "jquery";



/*
  Gets called every time and sends AJAX each time
*/

export default function() {
  if (!this.filtersInitialised) {
    return;
  }

  let state = this.$store.state;

  let params = {
    format: 'json',
    ordering: '-priority,-updated_on'
  };

  // let today = format(new Date, 'YYYY-MM-DD');
  // if (this.selectedDate.value !== -1) {
  //   let endDate = format(addDays(today, this.selectedDate.value), 'YYYY-MM-DD');
  //   params.occurs_between = today + ',' + endDate;
  // }
  // else {
  //   params.occurs_between = today + ',2100-01-01';
  // }


  // Date range parameters
  if (this.dateRange.length > 0){
    params.occurs_between = this.dateRange
  } else {
    params.occurs_between = format(new Date, 'YYYY-MM-DD') + ',2100-01-01'
  }

  const dateRangeVal = (this.dateRange !== format(new Date, 'YYYY-MM-DD') + ',2100-01-01') ? this.dateRange : ''

  if(dateRangeVal !== this.$store.getters.urlParams.dateRange) {
    this.$store.commit('singleURLParam', { dateRange: dateRangeVal})
  }

  // Disruption ID
  let disruptionId = window.location.search.match(/disruption=([0-9]+)/);
  if (this.initialPlot && disruptionId && disruptionId[1] !== undefined) {
    params.disruption = disruptionId[1];

    if(params.disruption !== this.$store.getters.urlParams.disruption) {
      this.$store.commit('singleURLParam', { disruption: params.disruption })
    }
  }


  // Selected Projects
  if (this.selectedProjects.length > 0) {
    params.project = this.selectedProjects.map(project => {
      return project;
    });

    if(params.project !== this.$store.getters.urlParams.project) {
      this.$store.commit('singleURLParam', { project: params.project })
    }
  }


  if (this.selectedTypes.length > 0) {
    params.type = this.selectedTypes.map(type => {
      return type;
    });

    if(params.type !== this.$store.getters.urlParams.type) {
      this.$store.commit('singleURLParam', { type: params.type })
    }
  }

  if (this.selectedPlace.id !== undefined) {
    params.place = [this.selectedPlace.id];

    if(params.place !== this.$store.getters.urlParams.place) {
      this.$store.commit('singleURLParam', { place: params.place })
    }
  }

  params.searchedPlace = '';
  if (state.searchedPlace !== false) {
    params.searchedPlace = state.searchedPlace.lat + '|' + state.searchedPlace.lng + '|' + state.searchedPlace.address;
    // original distance set to 2, changed to 99999 to assist with never hiding clusters
    params.within_radius = [state.searchedPlace.lng, state.searchedPlace.lat, '99999'].join(',');
    console.log(params.within_radius)
  }

  if(params.searchedPlace !== this.$store.getters.urlParams.searchedPlace) {
    this.$store.commit('singleURLParam', { searchedPlace: params.searchedPlace })
  }

  // keyword search
  if (this.keyword.length > 0){
    params.search = this.keyword
    this.$store.commit('singleURLParam', { search: params.search })
  }

  //because order can be "blank" we dont do a logic check
  params.ordering= this.ordering
  this.$store.commit('singleURLParam', { ordering: params.ordering })


  let disruptionsRequestedAt = new Date().getTime();
  this.disruptionsRequestedAt = disruptionsRequestedAt;

  jQuery.getJSON(disruptionsAPIEndpoint + "/disruptions/?" + jQuery.param(params), disruptions => {

    if (!(disruptions instanceof Array)) {
      return;
    }

    // This is not the latest request for disruptions.
    if (disruptionsRequestedAt < this.disruptionsRequestedAt) {
      return;
    }

    this.disruptions = disruptions.map(disruption => {
      disruption.start_date_full = disruption.start_date;
      disruption.date_range =
        format(disruption.start_date, 'D MMM YY') + ' &ndash; ' +
        format(disruption.end_date, 'D MMM YY');
      disruption.start_date = {
        month: format(disruption.start_date, 'MMM'),
        day: format(disruption.start_date, 'DD')
      };
      disruption.end_date = {
        month: format(disruption.end_date, 'MMM'),
        day: format(disruption.end_date, 'DD')
      };

      disruption.typeIcon = this.icons[0];
      if (disruption.type !== undefined && disruption.type !== null && disruption.type.length > 0) {
        let typeId = parseInt(disruption.type.match(/\d+/)[0]);
        disruption.typeIcon = this.icons.find(icon => {
          let type = this.types.find(type => type.id === typeId);
          return type !== undefined && type.icon.id === icon.id;
        }) || this.icons[0];
        disruption.typeName = this.types.reduce((typeName, type) => {
          return (type.value === typeId) ? type.label : typeName;
        }, 'No type');
      }

      if (disruption.project !== undefined) {
        let projectId = parseInt(disruption.project.match(/\d+/)[0]);
        disruption.projectName = this.projects.reduce((projectName, project) => {
          return (project.value === projectId) ? project.label : projectName
        }, 'No project');
      }

      disruption.places = [];
      if (disruption.impacted_places !== undefined) {
        disruption.places = disruption.impacted_places.map(place => {
          return parseInt(place.match(/\d+/)[0]);
        });
      }

      return disruption;
    });
  });
};
