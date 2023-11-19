<template>
  <div class="_google-btn-wrapper" @click="handleClick">
    <div ref="buttonRef">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useSlots } from "vue";
import config from "../composables/useGoogleOAuth/config";
import {
  Configuration,
  CredentialPopupResponse,
} from "../composables/useGoogleOAuth/types";
import { TokenPopupResponse } from "../composables/useGoogleOAuth/callbackTypes";
import { useGoogleOAuth } from "../composables/useGoogleOAuth/";

const { buttonConfig = config.defaultButtonConfig, onResponse } = defineProps<{
  buttonConfig?: object;
  onResponse?: Function;
  onError?: Function;
}>();

const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const slots = useSlots();
const hasSlot = !!slots.default;

const { googleSdkLoaded } = useGoogleOAuth();
const buttonRef = ref<HTMLElement | undefined>();

init();

function init() {
  googleSdkLoaded(() => {
    if (!buttonRef.value) return;
    if (hasSlot) return;

    const config: Configuration = {
      client_id,
      callback: (response: CredentialPopupResponse) => {
        onResponse && onResponse(response);
      },
    };

    window.google.accounts.id.initialize(config);
    window.google.accounts.id.renderButton(buttonRef.value, buttonConfig);
  });
}

const handleClick = () => {
  googleTokenLogin()
    .then((res) => onResponse && onResponse(res))
    .catch((err) => onResponse && onResponse(err));
};

const googleTokenLogin = () => {
  return new Promise((resolve, reject) => {
    window.google.accounts.oauth2
      .initTokenClient({
        client_id,
        scope: config.scopes,
        callback: (response: TokenPopupResponse) => {
          if (response.access_token) {
            resolve(response);
          }
          reject(response);
        },
      })
      .requestAccessToken();
  });
};
</script>

<style scoped>
._google-btn-wrapper {
  display: inline-block;
}
</style>
