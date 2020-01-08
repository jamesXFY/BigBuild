<template>
  <label class="search" for="form-search">
    <span class="icon icon-search"></span>
    <vue-google-autocomplete
      :country="['au']"
      ref="googleAutocomplete"
      :types="autocompleteType"
      @placechanged="placeChanged"
      @focus="autocompleteIsFocussed = true"
      @blur="autocompleteIsFocussed = false"
      @keypress="keypress"
      v-if="map !== false"
      id="form-search"
      classname="form-control"
      placeholder="Search a location"
      tabindex="1"
      :key="componentKey"
    ></vue-google-autocomplete>
    <button v-if="searchedPlace && autocompleteIsFocussed" @click="$emit('clear-filters')" class="close__search" type="button">
        <span class="icon-cross" aria-hidden="true">X</span>
        <span class="sr-only">Clear search</span>
    </button>
  </label>
</template>

<script>
  import VueGoogleAutocomplete from 'vue-google-autocomplete';
import Vue from 'vue';

  export default {
    name: 'SearchInput',
    props: ['map'],
    data() {
      return {
        autocompleteIsFocussed: false,
        keydownListenerAdded: false,
        componentKey: 0
      }
    },
    computed: {
      searchedPlace () {
        return this.$store.state.searchedPlace;
      },
      autocompleteType () {
        return this.$store.state.autocompleteType;
      }
    },
    watch: {
      searchedPlace () {
        if (this.searchedPlace === false) {
          this.$refs.googleAutocomplete.clear();
        }
        else if (this.searchedPlace.triggeredByURLChange !== undefined && this.searchedPlace.triggeredByURLChange === true) {
          this.$refs.googleAutocomplete.update(this.searchedPlace.address);
          this.$refs.googleAutocomplete.updateCoordinates({ lat: this.searchedPlace.lat, lng: this.searchedPlace.lng });
        }
      },
      autocompleteType () {
        this.$refs.googleAutocomplete.autocompleteType = this.autocompleteType
        this.forceRerender()
      }
    },
    components: {
      'VueGoogleAutocomplete': VueGoogleAutocomplete
    },
    methods: {
      forceRerender() {
        this.componentKey += 1
      },
      keypress(event) {
        if (!this.keydownListenerAdded) {
          // VueGoogleAutocomplete doesn't support keydown, which is required to watch for down and up arrows.
          document.getElementById('form-search').addEventListener('keydown', event => {
            clearTimeout(timeout);
            let timeout = setTimeout(() => {
              // Not enter, up, or down.
              if ([13, 38, 40].indexOf(event.which) !== -1) {
                document.getElementsByClassName('pac-container')[0].classList.add('pac-has-item-selected');
              } else {
                document.getElementsByClassName('pac-container')[0].classList.remove('pac-has-item-selected');
              }
            }, 250);
          });
          this.keydownListenerAdded = true;
        }

        if (event.which === 13) {
          if(this.$store.state.searchType == "Postcode"){
            var autocompleteOptions = {
              types: ['(regions)'],
              componentRestrictions: { country: "au" }
            };
          } else {
            var autocompleteOptions = {
              types: ['geocode'],
              componentRestrictions: { country: "au" }
            };
          }
          autocompleteOptions.input = event.target.value;
          const autocompleteService = new google.maps.places.AutocompleteService();
          autocompleteService.getPlacePredictions(autocompleteOptions, (predictions, status) => {
            if (predictions.length >= 1) {
              const placesService = new google.maps.places.PlacesService(document.createElement('div'));
              placesService.getDetails({ placeId: predictions[0].place_id }, (place, status) => {
                this.placeChanged({ latitude: place.geometry.location.lat(), longitude: place.geometry.location.lng() }, place);
                this.$refs.googleAutocomplete.update(this.searchedPlace.address);
              });
            }
          });
        }
      },
      placeChanged(addressData, placeResultData, id) {
        app.gaTracking('formtracking', 'form-field-exit', 'Location/keyword ('+placeResultData.formatted_address+')')
        this.$store.commit('searchedPlace', { lat: addressData.latitude, lng: addressData.longitude, address: placeResultData.formatted_address })
      }
    }
  }
</script>

<style scoped>
  button {
    background: white !important;
    font-size: 1rem;
    height: 68px;
    padding: 0 10px;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 2;
  }
</style>
