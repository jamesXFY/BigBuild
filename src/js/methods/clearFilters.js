import format from 'date-fns/format'

export default function() {
  this.mapBounds = [];
  this.showDates = false;
  this.showTypes = false;
  this.showProjects = false;
  this.$store.commit('searchedPlace', false);
  this.keyword = '';
  this.ordering = '';
  this.selectedPostcode = false;
  this.selectedPlace = false;
  // this.selectedDate = { 'label': 'all disruptions', 'value': -1 };
  this.selectedDisruptions = {};
  this.selectedProjects = [];
  this.selectedTypes = [];
  this.dateRange = `${format(new Date, 'YYYY-MM-DD')},2100-01-01`;
  this.dateOne = '';
  this.dateTwo = '';
  // this.places = '';
  this.searchType = 'Location';
  this.$store.commit('updateCurrentDisruption', '');
  this.$store.commit('urlParams', {
      dateRange: '',
      project: '',
      type: '',
      place: '',
      searchedPlace: '',
      disruption: '',
      search:'',
    });
};
