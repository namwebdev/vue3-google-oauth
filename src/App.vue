<script setup lang="ts">
import GoogleLogin from "./components/GoogleLogin.vue";
// import { useGoogleOAuth } from "./composables/useGoogleOAuth/";

// const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// useGoogleOAuth().init(clientId);
// useGoogleOAuth()
//   .googleOneTap(clientId)
//   .then((res) => {
//     console.log(res);
//   });

const callback = (res: any) => {
  console.log("🚀 ~ file: App.vue:5 ~ res:", res);
};
</script>

<template>
  <GoogleLogin :onResponse="callback">test</GoogleLogin>
</template>
