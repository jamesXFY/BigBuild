<template>
  <div class="infoWindow">
    <div @click="$emit('updateSelectedDisruption', disruption)" v-for="disruption in disruptions" :key="disruption.id">
      <h4>{{ disruption.name }}</h4>
      <p class="infoWindow__location">{{ disruption.location }}</p>
      <p class="infoWindow__date" :style="'background-color: rgba(' + disruption.typeIcon.rgbColour + ',.1);'">
        {{ disruption.start_date.month }} {{ disruption.start_date.day }} -
        {{ disruption.end_date.month }} {{ disruption.end_date.day }}
      </p>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'PlaceInfoWindow',
    props: [
      'disruptions'
    ]
  }
</script>

<style scoped>

  .infoWindow {
    font-size: 1rem;
    margin-top: .5rem;
    padding-left: .25rem;
    overflow: visible;
  }

  .infoWindow > div:not(:last-child) {
    border-bottom: 1px solid #ccc;
    padding-bottom: .75rem;
    margin-bottom: .75rem;
  }

  h4 {
    font-size: 1rem;
    letter-spacing: inherit;
    margin-bottom: 0;
  }

  p {
    margin-bottom: 0;
  }

  .infoWindow__location {
    padding-bottom: .1rem;
  }

  .infoWindow__date {
    border-radius: .25rem;
    display: inline-block;
    font-size: .75rem;
    font-weight: bold;
    margin: .25rem 0 .25rem -.25rem;
    padding: .2rem .4rem;
    text-transform: uppercase;
  }

</style>
