'use strict';
import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate'
import GoogleMapsLoader from 'google-maps';
import MarkerClusterer from 'marker-clusterer-plus';
import AirbnbStyleDatepicker from 'vue-airbnb-style-datepicker';
import format from 'date-fns/format';
import Switches from 'vue-switches';

// import jQuery from "jquery"
import MobileFilterComponent from './components/MobileFilter';
import SearchInputComponent from './components/SearchInput';
import OnboardingModalComponent from './components/OnboardingModal';
import ModalComponent from './components/Modal';

// Custom vue methods.
import clearFilters from './methods/clearFilters';
import initialiseFilters from './methods/initialiseFilters';
import initialiseMapControls from './methods/initialiseMapControls';
import updateDisruptions from './methods/updateDisruptions';
import updateOverlayMarkers from './methods/updateOverlayMarkers';
import urlParamsUpdated from './methods/urlParamsUpdated';
import createMarkerFromGeometry from "./functions/createMarkerFromGeometry";
import zoomToFit from './functions/zoomToFit';

GoogleMapsLoader.KEY = 'AIzaSyCc0_AXfe4A4tpsTQPX7DEMKinLjNVAdEA';
if (process && process.env && process.env.NODE_ENV === 'dev') {
  GoogleMapsLoader.KEY = 'AIzaSyDkwoZiBl2dIl2l0t1Xl50yUjcwTLjb6XA';
}

GoogleMapsLoader.LIBRARIES = ['geometry', 'places'];

Vue.use(Vuex);

// see docs for available options
const datepickerOptions = {
  colors: {
    selected: '#f46b15',
    inRange: '#f9a976',
    selectedText: '#fff',
    text: '#565a5c',
    inRangeBorder: '#f79456',
    disabled: '#fff',
  }
}

// make sure we can use it in our components
Vue.use(AirbnbStyleDatepicker, datepickerOptions)

const store = new Vuex.Store({
  state: {
    currentDisruption: '',
    urlParams: {
      dateRange: '',
      project: '',
      type: '',
      place: '',
      searchedPlace: '',
      disruption: '',
      search: '',
      ordering: ''
    },
    searchedPlace: false,
    showAllFilters: false,
    showOnboarding: true,
    showTableView: false,
    resetMarkers: true,
    search: false,
    ordering: false,
    searchType: 'Location',
    autocompleteType: 'geocode'
  },
  mutations: {
    hideOnboarding (state) {
      state.showOnboarding = false;
    },
    searchedPlace (state, value) {
      state.searchedPlace = value;
    },
    search (state, value) {
      state.search = value;
    },
    ordering (state, value) {
      state.ordering = value;
    },
    searchType (state, value) {
      state.searchType = value
    },
    updateCurrentDisruption (state, value) {
      state.currentDisruption = value;
    },
    toggleShowAllFilters (state) {
      state.showAllFilters = !state.showAllFilters;
    },
    toggleShowTableView (state) {
      state.showTableView = !state.showTableView;
    },
    autocompleteType (state, value) {
      state.autocompleteType = value;
    },
    resetMarkers (state, value) {
      state.resetMarkers = value;
    },
    urlParams(state, payload) {
      state.urlParams = payload
    },
    singleURLParam(state, payload) {
      Vue.set(state.urlParams, Object.keys(payload)[0], payload[Object.keys(payload)[0]])
    }
  },
  plugins: [createPersistedState({ paths: ['showOnboarding'] })],
  getters: {
    urlParams(state) {
      return state.urlParams
    }
  },
});

window.app = new Vue({
  el: '#disruptionMap',
  store,
  components: {
    'MobileFilter': MobileFilterComponent,
    'SearchInput': SearchInputComponent,
    'OnboardingModal': OnboardingModalComponent,
    'Modal': ModalComponent,
    Switches
  },
  data: {
    autocomplete: {},
    detours: [],
    disruptions: [],
    disruptionsRequestedAt: 0,
    icons: [],
    infoWindow: false,
    initialPlot: true,
    map: false,
    mapBounds: [],
    mapMarkers: [],
    mapMarkerHighestZIndex: 10,
    markerCluster: false,
    placeMarkers: [],
    places: [],
    pseudoMarkers: [],
    placeDisruptions: {},
    // Filters.
    dates: [
      { 'label': 'today', 'value': 0 },
      { 'label': 'next 7 days', 'value': 7 },
      { 'label': 'all disruptions', 'value': -1 }
    ],
    projects: [],
    types: [],
    // Filter state.
    filtersInitialised: false,
    hoveredDisruption: {},
    searchedPlaceMarker: false,
    selectedDate: { 'label': 'all disruptions', 'value': -1 },
    selectedDisruption: false,
    selectedDisruptionModal: false,
    selectedPlace: false,
    keyword: '',
    ordering: '',
    searchType: 'Location',
    selectedPostcode: false,
    selectedProjects: [],
    selectedTypes: [],
    // Menu state.
    showDates: false,
    showTypes: false,
    showProjects: false,
    showDropUp: false,
    mapEnabled: true,
    dateFormat: 'D MMM YYYY',
    dateOne: '',
    dateTwo: '',
    dateRange: '',
    mapToggleLabel: 'Hide map',
    today: format(new Date, 'YYYY-MM-DD'),
    copiedLink: false,
    timeout: {}
  },
  filters: {
    titleCase(text) {
      if (!text) return ''
      text = text.toString()
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
  },
  methods: {
    copyURLClipboard() {
      let el = document.createElement('input');
      el.value = window.location.href;
      document.body.appendChild(el);
      jQuery(el).prop('contenteditable', 'true')
      jQuery(el).prop('readonly', 'true')
      // el.contenteditable = true;
      // el.readonly = true;

      if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
        // create a selectable range
        var range = document.createRange();
        range.selectNodeContents(el);

        // select the range
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        el.setSelectionRange(0, 999999);
      } else {
        el.select();
      }

      document.execCommand('copy');
      document.body.removeChild(el);

      if(!this.copiedLink) {
        this.copiedLink = true

        this.timeout = setTimeout(() => {
          this.copiedLink = false
        }, 5000);
      }

      // alert('URL has been copied.');
    },
    gaTracking(eventCategory, eventAction, eventLabel, eventValue){
      _gaq.push(['SITETracker._trackEvent', eventCategory, eventAction, eventLabel, eventValue]);
    },
    formatDates(dateOne, dateTwo) {
      let formattedDates = ''
      if (dateOne) {
        formattedDates = format(dateOne, this.dateFormat)
      }
      if (dateTwo) {
        formattedDates += ' - ' + format(dateTwo, this.dateFormat)
      }

      return formattedDates
    },
    onDateRangeClose() {
      if(this.dateOne.length > 0 && this.dateTwo.length > 0) {
        this.dateRange = `${this.dateOne},${this.dateTwo}`
      } else {
        this.dateRange = `${format(new Date, 'YYYY-MM-DD')},2100-01-01`
      }
      app.gaTracking('formtracking', 'form-field-checked', 'Search filter/Date Range')
      this.updateDisruptions();
    },
    onDateRangeCancelled() {
      this.dateOne = ''
      this.dateTwo = ''

      this.dateRange = `${format(new Date, 'YYYY-MM-DD')},2100-01-01`
      app.gaTracking('formtracking', 'form-field-unchecked', 'Search filter/Date Range')
      this.updateDisruptions();
    },
    clearFilters: clearFilters,
    keywordSearch() {
      this.updateDisruptions()
    },
    sortBy() {
      this.updateDisruptions()
    },
    detourContent() {
      let detours = this.detours.filter(detour => {
        return detour.disruptions.find(disruption => disruption.match('/disruptions/' + this.selectedDisruption.id));
      });
      if (detours) {
        return detours.reduce((accumulator, detour) => accumulator + `${detour.description} ${detour.instructions}`, '');
      }
      return '';
    },
    initialiseFilters: initialiseFilters,
    initialiseMapControls: initialiseMapControls,
    updateDisruptions: updateDisruptions,
    updateOverlayMarkers: updateOverlayMarkers,
    updateClustering() {
      let visibleMapMarkers = this.markerCluster.getMarkers()
        .filter(marker => marker.map !== null);

      if (this.infoWindow && 0 === visibleMapMarkers.filter(marker => marker.id === this.infoWindow.marker.id).length) {
        this.infoWindow.close();
      }

      let overlayMarkers = this.updateOverlayMarkers(visibleMapMarkers, this.mapMarkers, this.places);

      if (window.matchMedia && window.matchMedia("(max-width: 990px)").matches) {
        overlayMarkers.forEach(marker => {
          let onClick = () => {
            if (this.infoWindow) {
              this.infoWindow.close();
            }
            this.infoWindow = new google.maps.InfoWindow({
              content: marker.infoWindowComponent.$el,
              marker: marker
            });
            let pseudoMarker = new google.maps.Marker({
              position: marker.getPosition(),
              map: this.map,
              visible: false,
            });
            this.infoWindow.open(app.map, pseudoMarker);

            marker.infoWindowComponent.$on('updateSelectedDisruption', (disruption) => {
              this.selectedDisruption = disruption;
            });
          };
          google.maps.event.addDomListener(marker.div, 'mousedown', onClick);
          google.maps.event.addDomListener(marker.div, 'touchstart', onClick);
        });
      }

      this.mapMarkers = overlayMarkers;
    },
    urlParamsUpdated: urlParamsUpdated,
  },
  computed: {
    urlParams() {
      return this.$store.getters.urlParams;
    },
    htmlDescription() {
      if (this.selectedDisruption.description.indexOf("</")> 0) {
        return this.selectedDisruption.description
      } else {
        return false
      }
    },
    selectedDisruptionHasDetour() {
      let detour = this.detours.find(detour => {
        return detour.disruptions.find(disruption => disruption.match('/disruptions/' + this.selectedDisruption.id));
      });

      if (this.selectedDisruption && detour) {
        return true;
      }

      return false;
    },
    searchedPlace () {
      return this.$store.state.searchedPlace;
    },
    selectedFilters(newSelectedFilters, oldSelectedFilters) {
      if (this.selectedProjects.length + this.selectedTypes.length === 0
        && this.searchedPlace === false
        && this.selectedPostcode === false
        && this.selectedPlace === false
        && this.selectedDate.value === -1
        && this.search === false
        && this.orderBy === false) {
        return false;
      }
      return {
        searchedPlace: this.searchedPlace,
        selectedDate: this.selectedDate.value,
        selectedPostcode: this.selectedPostcode,
        selectedPlace: this.selectedPlace,
        selectedProjects: this.selectedProjects,
        selectedTypes: this.selectedTypes,
        search: this.search,
        ordering: this.orderBy
      };
    },
    showAllFilters() {
      return this.$store.state.showAllFilters;
    },
    showTableView () {
      return this.$store.state.showTableView;
    },
    site () {
      return (window.disruptionsSite !== undefined) ? window.disruptionsSite : 'bigbuild';
    }
  },
  watch: {
    urlParams: {
      handler: (newParams, oldParams) => {
        history.pushState(
          newParams,
          null,
          location.pathname + '?' + jQuery.param(newParams)
        )
      },
      deep: true,
    },
    mapEnabled() {
      this.$store.commit('toggleShowTableView')
      if (this.$store.state.showTableView) {
        this.mapToggleLabel = 'Show map'
      } else {
        this.mapToggleLabel = 'Hide map'
      }
    },
    searchType() {
      this.$store.commit('searchType', this.searchType)
      if (this.$store.state.searchType !== "Keyword") {
        this.keyword =  '';
        if (this.$store.state.searchType == "Postcode") {
          this.$store.commit('autocompleteType', '(regions)')
        } else {
          this.$store.commit('autocompleteType', 'geocode')
        }
      }
    },
    selectedTypes: {
      handler: (newParams, oldParams) => {
        const newParamsChanged = newParams.filter(function(i) {return oldParams.indexOf(i) < 0;})
        const oldParamsChanged = oldParams.filter(function(i) {return newParams.indexOf(i) < 0;})

        if(newParamsChanged.length === 1) {
          app.gaTracking('formtracking', 'form-field-checked', 'Search filter/Travel Mode (type='+newParamsChanged[0]+')')
        } else if(oldParamsChanged.length === 1) {
          app.gaTracking('formtracking', 'form-field-unchecked', 'Search filter/Travel Mode (type='+oldParamsChanged[0]+')')
        }
      },
      deep: true,
    },
    selectedProjects: {
      handler: (newParams, oldParams) => {
        const newParamsChanged = newParams.filter(function(i) {return oldParams.indexOf(i) < 0;})
        const oldParamsChanged = oldParams.filter(function(i) {return newParams.indexOf(i) < 0;})

        if(newParamsChanged.length === 1) {
          app.gaTracking('formtracking', 'form-field-checked', 'Search filter/Project (type='+newParamsChanged[0]+')')
        } else if(oldParamsChanged.length === 1) {
          app.gaTracking('formtracking', 'form-field-unchecked', 'Search filter/Project (type='+oldParamsChanged[0]+')')
        }
      },
      deep: true,
    },
    disruptions(newDisruptions, oldDisruptions) {
      if (!this.$store.state.resetMarkers) {
        this.$store.commit('resetMarkers', true)
        return;
      };
      if (this.map !== false) {
        let count = 1;
        let pseudoMarkers = [];
        let placeIds = [];
        let placeDisruptions = {};
        newDisruptions.forEach(disruption => {
          if (disruption.places && disruption.places.length > 0) {
            for (let i=0; i < disruption.places.length; i++) {
              if (placeDisruptions.hasOwnProperty(disruption.places[i])) {
                placeDisruptions[disruption.places[i]] = placeDisruptions[disruption.places[i]] + "," + disruption.id;
              } else {
                placeDisruptions[disruption.places[i]] = String(disruption.id);
              }
            }
            // Disruption has a place, so plot place instead.
            disruption.places.forEach(placeId => {
              if (placeIds.indexOf(placeId) !== -1) {
                return;
              }
              placeIds.push(placeId);
              let place = this.places.find(place => place.id === placeId);
              let position = createMarkerFromGeometry(place.geometry);
              count ++;
              if (place && position !== null) {
                pseudoMarkers.push(new google.maps.Marker({
                  position: position,
                  map: this.map,
                  visible: false,
                  markerType: 'place',
                  markerDisruption: disruption,
                  markerPlace: place,
                  id: 'place' + place.id,
                  parentDisruption: disruption.id
                }));
              }
            });
          }
          else {
            let position = createMarkerFromGeometry(disruption.geometry);
            if (position !== null) {
              pseudoMarkers.push(new google.maps.Marker({
                position: position,
                map: this.map,
                visible: false,
                markerType: 'disruption',
                markerDisruption: disruption,
                id: 'disruption' + disruption.id
              }));
            }
          }
        });
        this.pseudoMarkers = pseudoMarkers;
        this.placeDisruptions = placeDisruptions;
      }
    },
    initialPlot(newValue, oldValue) {
      if (newValue || !oldValue) {
        return;
      }

      let disruptionId = window.location.search.match(/disruption=([0-9]+)/);
      if (!disruptionId || disruptionId[1] === undefined) {
        return;
      }

      let disruption = this.disruptions.find(disruption => disruption.id === parseInt(disruptionId[1]));
      if (!disruption) {
        return;
      }

      if (disruption.places.length) {
        let place = this.places.find(place => place.id === disruption.places[0]);
        if (place) {
          this.selectedPlace = place;
        }
      }
      else {
        this.selectedDisruption = disruption;
      }
    },
    pseudoMarkers(newMarkers, oldMarkers) {
      let markersToRemove = oldMarkers.filter(marker => !newMarkers.includes(marker));
      this.markerCluster.removeMarkers(markersToRemove);
      if (newMarkers.length === 0) {
        this.markerCluster.clearMarkers();
      }
      this.markerCluster.addMarkers(newMarkers);
      if (this.initialPlot) {
        zoomToFit(this);
        this.initialPlot = false;
      }
    },
    selectedDisruption(newDisruption, oldDisruption) {
      if (this.selectedPlace) {
        return
      }

      if(!this.selectedDisruption) {
        this.copiedLink = false
      }

      // console.log(newDisruption)
      // console.log(newDisruption.id)
      // console.log(newDisruption.places[0].id)
      // this.pseudoMarkers.map((marker) => {
      //   const markerID = marker.id
      //   if (markerID.includes(newDisruption.id) || markerID.includes(newDisruption.places[0].id)) {
      //     console.log(marker)
      //   }
      // })

      let marker = this.pseudoMarkers.find(marker => marker.id === 'disruption' + newDisruption.id);

      if (marker) {
        this.map.panTo(marker.getPosition());
        // if (this.map.getZoom() < 15) {
        //   this.map.setZoom(15);
        // }

        if (this.map.getZoom() < 18) {
          this.map.setZoom(18);
        }
      } else {
        let marker = this.pseudoMarkers.find(marker => marker.id === 'place' + this.$store.state.urlParams.place);
        if (marker) {
          this.map.panTo(marker.getPosition());
           if (this.map.getZoom() < 15) {
             this.map.setZoom(15);
           }
          }
        //  } else {
        //   let marker = this.pseudoMarkers.find(marker => marker.id === 'place' + newDisruption.places[0].id);
        //     if (marker) {
        //       this.map.panTo(marker.getPosition());
        //       if (this.map.getZoom() < 15) {
        //         this.map.setZoom(15);
        //       }
        //     }
        //  }
      }

      let oldMarker = this.mapMarkers.find(marker => marker.id === 'disruption' + oldDisruption.id);

      if (oldMarker) {
        oldMarker.setHovered(false);
      } else {
        if (oldDisruption) {
          for (let x=0; x <oldDisruption.places.length; x++) {
            // console.log("looking for marker "+ oldDisruption.places[x])
            let oldMarker = this.mapMarkers.find(marker => marker.id === 'place' + oldDisruption.places[x]);
            if (oldMarker) {
              oldMarker.setHovered(false);
            }
          }
        }
      }

      let visibleMarker = this.mapMarkers.find(marker => marker.id === 'disruption' + newDisruption.id);

      if (visibleMarker) {
        this.mapMarkerHighestZIndex += 10;
        visibleMarker.setHovered(true, this.mapMarkerHighestZIndex);
      } else {
        let visibleMarker = this.mapMarkers.find(marker => marker.id === 'place' + this.$store.state.urlParams.place);
        if (visibleMarker) {
          this.mapMarkerHighestZIndex += 10;
          visibleMarker.setHovered(true, this.mapMarkerHighestZIndex);
        } else {
           let placeCluster = this.pseudoMarkers.filter(marker => marker.parentDisruption === newDisruption.id);
           var googleMapBounds = new google.maps.LatLngBounds();
           //check to make sure its not just a standard invisible disruption
           if (placeCluster.length > 0) {
             for (let x=0; x <placeCluster.length; x++) {
               let visibleMarker = placeCluster[x];
               googleMapBounds.extend(placeCluster[x].position);
             }

             this.map.fitBounds(googleMapBounds);
             this.map.setCenter(googleMapBounds.getCenter());
           }

          //  this.map.fitBounds(googleMapBounds);
          //  this.map.setCenter(googleMapBounds.getCenter());
        }
      }

      Vue.set(this.$store.state.urlParams, 'place', '')
      Vue.set(this.$store.state.urlParams, 'disruption', newDisruption.id)

      store.commit('updateCurrentDisruption', newDisruption.id)
    },
    selectedFilters(newValue, oldValue) {
      // console.log('selectedFilters')
      this.updateDisruptions();
    },
    selectedPostcode(newPostcode, oldPostcode) {
      if (!newPostcode) {
        this.map.setZoom(this.map.getZoom() - 2);
        return;
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: newPostcode, componentRestrictions: { country: 'AU' }}, (results, status) => {
        if (status ==='OK') {
          this.$store.commit('searchedPlace', {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
            address: 'Postcode: ' + newPostcode
          });
        }
      });
    },
    searchedPlace(newPlace, oldPlace) {
      // Hack to prevent autocomplete results from hiding on enter. Also see window.onload below.
      if (document.getElementById('autocomplete-force-show')) {
        document.getElementById('autocomplete-force-show').remove();
      }

      if (this.searchedPlaceMarker) {
        this.searchedPlaceMarker.setMap(null);
      }

      if (!newPlace) {
        return;
      }

      if (!this.selectedDisruptionModal) {
        this.selectedDisruption = false;
        this.map.setCenter(newPlace);
        this.map.setZoom(15);
      }

      this.searchedPlaceMarker = new google.maps.Marker({
        position: newPlace,
        map: this.map
      });
      
      // Avoid zoomToFit, as we want to focus on the searchedPlaceMarker, not the returned disruptions.
      this.initialPlot = false;
      this.updateDisruptions();
    },
    selectedPlace(newPlace, oldPlace) {
      if (!newPlace) {
        this.map.setZoom(this.map.getZoom() - 2);
        return;
      }

      let marker = this.pseudoMarkers.find(marker => marker.id === 'place' + newPlace.id);
      if (marker) {
        if (window.matchMedia && window.matchMedia("(max-width: 767px)").matches) {
          this.showTableView = true;
        }
        else {
          this.map.panTo(marker.getPosition());
          if (this.map.getZoom() < 15) {
            this.map.setZoom(15);
          }
        }

      }
      let visibleMarker = this.mapMarkers.find(marker => marker.id === 'place' + newPlace.id);
      if (visibleMarker) {
        this.mapMarkerHighestZIndex += 10;
        visibleMarker.setHovered(true, this.mapMarkerHighestZIndex);
      }

      let oldMarker = this.mapMarkers.find(marker => marker.id === 'place' + oldPlace.id);
      if (oldMarker) {
        oldMarker.setHovered(false);
      }
    },
    showAllFilters(newState, oldState) {
      // TODO: This prevents iOS from selecting the search input when clicking the filter button.
      // There should be a better way to do this.
      document.getElementById('form-search').blur();
    }
  },
  mounted() {
    // console.log('mounted')
    GoogleMapsLoader.load(google => {
      window.google = google;
      let melbourne = { lat: -37.8136, lng: 144.9631 };
      this.map = new google.maps.Map(
        document.getElementById('map'), {
          center: melbourne,
          zoom: 12,
          fullscreenControl: false,
          mapTypeControl: false,
          clickableIcons: false,
          streetViewControl: false,
          disableDefaultUI: true,
          styles: [
            {
              "featureType": "poi.business",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            }
          ]
        }
      );
      // console.log('google loaded')
      let postcode = window.location.search.match(/postcode=([0-9]{4})/);
      if (postcode && postcode[1] !== undefined) {
        this.selectedPostcode = postcode[1];
        this.initialPlot = false;
      }
      // console.log('onboarding')
      this.showOnboarding = localStorage.getItem("isDoneOnBoarding") === null;
      // console.log('initialiseFilters')
      this.initialiseFilters();
      // console.log('initialiseMapControls')
      this.initialiseMapControls();

      this.markerCluster = new MarkerClusterer(this.map, [], {
        averageCenter: true,
        maxZoom: 17,
        gridSize: 50,
        imagePath: 'https://bigbuild.vic.gov.au/__data/assets/file/0004/301990/m',
        imageExtension: 'svg',
        clusterClass: 'mapCluster',
        styles: [{
          url: 'https://bigbuild.vic.gov.au/__data/assets/file/0004/301990/m1.svg',
          height: 72,
          width: 72,
          anchor: [0,0],
          textColor: '#FFFFFF',
          textSize: "18",
          backgroundPosition: '0 0'
        }],
        // minimumClusterSize: 3,
      });

      google.maps.event.addListener(this.markerCluster, 'clusteringend', (markerCluster) => {

        this.updateClustering(markerCluster);
        let visibleMarker = this.mapMarkers.find(marker => marker.id === 'disruption'+this.$store.state.currentDisruption)

        if(visibleMarker) {
          this.mapMarkerHighestZIndex += 10;
          visibleMarker.setHovered(true, this.mapMarkerHighestZIndex);
        }
      });
    });

    window.onpopstate = () => {
      this.urlParamsUpdated();
      this.updateDisruptions();
    };
  }
});
