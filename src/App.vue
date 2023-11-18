<script setup lang="ts">
import { useGoogleOAuth } from "./composables/useGoogleOAuth/";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// useGoogleOAuth().init(clientId);
useGoogleOAuth()
  .googleOneTap(clientId)
  .then((res) => {
    console.log(res);
  });
</script>

<template>
  <div>test</div>
</template>
