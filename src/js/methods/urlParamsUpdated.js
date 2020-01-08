import queryString from 'query-string';
import format from 'date-fns/format';
export default function() {
  const params = queryString.parse(location.search, { arrayFormat: 'bracket'});
  const projects = (params.project !== undefined && params.project !== '') ? params.project : [];
  const types = (params.type !== undefined && params.type !== '') ? params.type : [];
  // const date = (params.date !== undefined && params.date !== '' && [0,-1,7].indexOf(parseInt(params.date)) !== -1) ? parseInt(params.date) || 0 : -1;
  const dateRanges = ((params.dateRange !== undefined && params.dateRange !== '' && params.dateRange !== format(new Date, 'YYYY-MM-DD') + ',2100-01-01')) ? params.dateRange : '';
  const searchedPlace = (params.searchedPlace !== undefined && params.searchedPlace !== '') ? params.searchedPlace.split('|') || [] : [];
  
  this.keyword = (params.search !== undefined && params.search !== '') ? params.search : '';
  this.ordering = (params.ordering !== undefined && params.ordering !== '') ? params.ordering : '';
  this.dateRange = dateRanges
  this.dateOne = dateRanges.split(',')[0]
  this.dateTwo = dateRanges.split(',')[1]
  // this.selectedDate = this.dates.find(dateOption => dateOption.value === date);
  this.selectedProjects = projects.map(value => parseInt(value) || 0);
  this.selectedTypes = types.map(value => parseInt(value) || 0);
  this.selectedPlace = params.place !== undefined ? this.places.find(place => place.id === parseInt(params.place)) || false : false;
  this.$store.commit('searchedPlace', (searchedPlace.length === 3) ? {
    lat: parseFloat(searchedPlace[0]),
    lng: parseFloat(searchedPlace[1]),
    address: searchedPlace[2],
    triggeredByURLChange: true,
  } : false);
};
