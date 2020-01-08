<template>
  <div class="modal">
    <div class="content">
      <button @click.stop="$emit('close')" aria-label="Close" class="icon-close">
        <span class="visuallyhidden">Close</span>
      </button>
      <div class="main">
        <span v-html="content"></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'content',
  ]
}
</script>

<style>
  .modal img {
    max-width: 100%;
  }
</style>

<style scoped>
  @keyframes blowUpModal {
    0% {
      transform:scale(0);
    }
    100% {
      transform:scale(1);
    }
  }

  @keyframes slideIn {
    0% {
      transform:translateX(100%);
    }
    100% {
      transform:translateX(0);
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .modal {
    display: block;
    flex-direction: row;
    left: 0;
    min-height: 100%;
    min-width: 100%;
    overflow: auto;
    padding: 2rem;
    position: fixed;
    top: 70px;
    z-index: 10;
  }

  .modal:before {
    animation: fadeIn .5s linear forwards;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: rgba(0,0,0,0.4);
  }

  .content {
    animation: slideIn .25s linear forwards;
    position: absolute;
    right: 0;
    bottom: 0;
    height: calc(100% - 60px);
    width: 100%;
    background-color: white;
  }

  .modal button {
    background: none;
    border: 0;
    color: black;
    position: fixed;
    right: 1rem;
    top: 1rem;
    z-index: 11;
  }

  .modal button:after {
    background-color: white;
    content: "X";
    display: inline-block;
    font-size: 1em;
    text-align: center;
    vertical-align: middle;
  }

  .main {
    padding: 2rem;
    width: 100%;
  }

  @media (min-width: 991px) {
    .modal {
      top: 90px;
    }

    .content {
      width: calc(100% - 300px);
    }
  }

  @media (min-width: 1280px) {
    .content {
      width: calc(100% - 450px);
    }
  }

  @media (max-width: 767px) {
    .main {
      padding: 1rem .25rem;
    }

    .modal button {
      right: -.5rem;
      top: 0;
    }
  }

  .visuallyhidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }
</style>
