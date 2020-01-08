<template>
  <div
    class="mobileFilter"
    v-bind:class="{
      mobileFilter__searchWithFilter : filterCount > 0,
      mobileFilter__searchWithoutFilter : filterCount === 0 && this.$store.state.searchedPlace
    }"
  >
    <button
      class="listMap"
      @click="$store.commit('toggleShowTableView')"
    >{{ listMapButtonText }}
    </button><button
      class="filters"
      @click="$store.commit('toggleShowAllFilters')">
      Filters
      <span class="count" v-if="filterCount > 0">{{ filterCount }}</span>
    </button><button
      class="clearSearch"
      :class="{ 'hasFilter': filterCount > 0 }"
      v-if="filterCount > 0 || this.$store.state.searchedPlace"
      @click="$emit('clear-filters')"
      >
      Clear search
    </button>
  </div>
</template>

<script>
  export default {
    name: 'MobileFilter',
    props: [
      'selected-date',
      'selected-postcode',
      'selected-place',
      'selected-projects',
      'selected-types'
    ],
    computed: {
      filterCount() {
        let count = 0;
        count += (this.selectedDate.value !== -1) ? 1 : 0;
        count += (this.selectedPostcode) ? 1 : 0;
        count += (this.selectedPlace) ? 1 : 0;
        count += (this.selectedProjects.length > 0) ? 1 : 0;
        count += (this.selectedTypes.length > 0) ? 1 : 0;
        return count;
      },
      showAllFilters () {
        return this.$store.state.showAllFilters;
      },
      showTableView () {
        return this.$store.state.showTableView;
      }
    },
    watch: {
      showTableView () {
        this.listMapButtonText = (this.showTableView === false) ? 'List' : 'Map';
      }
    },
    data: () => {
      return {
        listMapButtonText: 'List'
      }
    }
  }
</script>

<style scoped>

  .globalMap__map.active + .sidebar + .navbar .mobileFilter {
    display: none;
  }

  .mobileFilter {
    background-color: white;
    border-radius: 1.5rem;
    bottom: 30px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .2);
    left: 50%;
    padding: 0 .5rem;
    position: fixed;
    text-align: center;
    transform: translateX(-50%);
  }

    .mobileFilter__searchWithoutFilter {
      min-width: 14.5rem;
    }

    .mobileFilter__searchWithFilter {
      min-width: 16rem;
    }

  button {
    background-color: transparent;
    border: 0 transparent;
    display: inline-block;
    font-size: .75rem;
    line-height: 1.25rem;
    padding: .5rem;
    text-transform: uppercase;
  }

  button:not(:last-child) {
    border-right: 1px solid #ccc;
  }

  .count {
    background-color: #F46B15;
    border-radius: 1.5rem;
    color: white;
    display: inline-block;
    height: 1.25rem;
    line-height: 1.25rem;
    width: 1.25rem;
  }

  .clearSearch {
    background-color: #F46B15;
    color: white !important;
    padding-right: 0;
  }

  .clearSearch:after {
    content: ' ';
    background-color: #F46B15;
    border-radius: 1.5rem;
    display: block;
    height: calc(2.25rem);
    position: absolute;
    right: -.5rem;
    top: 0;
    width: 3rem;
    z-index: -1;
  }

  .clearSearch.hasFilter:after {
    right: 0;
  }

  @media (min-width: 991px) {
    .mobileFilter {
      display: none;
    }
  }

</style>
