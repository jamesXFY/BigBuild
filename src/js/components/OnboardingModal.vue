<template>
  <div class="globalMap__onboarding" v-if="showOnboarding">
    <div class="globalMap__onboarding__content">
      <div class="globalMap__onboarding__content__title"></div>
      <div class="globalMap__onboarding__content__intro">
        <h3><slot name="title"></slot></h3>
        <slot name="content"></slot>
        <button @click="hideOnboarding" class="btn btn-primary pull-right">{{ buttonText }}</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'OnboardingModal',
    props: [
      'button-text'
    ],
    methods: {
      hideOnboarding() {
        this.$store.commit('hideOnboarding');
      }
    },
    computed: {
      showOnboarding () {
        return this.$store.state.showOnboarding;
      },
    }
  }
</script>
