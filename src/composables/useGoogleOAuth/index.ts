import { ref } from "vue";
import type * as types from "./types";
import config from "./config";

declare global {
  interface Window extends types._Window {}
}

const isGoogleApiLoaded = ref(false);
const clientId = ref("");

export function useGoogleOAuth() {
  const init = (client_id: string) => {
    if (!client_id) throw new Error("Client ID is required!");

    clientId.value = client_id;

    loadGoogleApi.then(() => {
      if (!client_id) return;

      const config: types.Configuration = {
        client_id,
      };

      window.google.accounts.id.initialize(config);
      window.google.accounts.id.prompt();
    });
  };

  const googleOneTap = (
    client_id?: string
  ): Promise<types.CredentialPopupResponse> => {
    if (client_id) clientId.value = client_id;

    if (!clientId.value) throw new Error("Client ID is required!");

    return new Promise((resolve, reject) => {
      const config: types.Configuration = {
        client_id: clientId.value,
        callback: (response: types.CredentialPopupResponse) => {
          if (response.credential) resolve(response);

          reject(response);
        },
      };

      googleSdkLoaded(() => {
        window.google.accounts.id.initialize(config);
        window.google.accounts.id.prompt(
          (notification: types.PromptNotification) => {
            handlePromptError(notification);
          }
        );
      });
    });
  };

  const handlePromptError = (notification: types.PromptNotification) => {
    let errorMessage: string = "";
    if (notification.isNotDisplayed()) {
      if (notification.getNotDisplayedReason() === "suppressed_by_user") {
        errorMessage = `Prompt was suppressed by user'. Refer https://developers.google.com/identity/gsi/web/guides/features#exponential_cooldown for more info`;
      } else {
        errorMessage = `Prompt was not displayed, reason for not displaying: ${notification.getNotDisplayedReason()}`;
      }
    }
    if (notification.isSkippedMoment()) {
      errorMessage = `Prompt was skipped, reason for skipping: ${notification.getSkippedReason()}`;
    }

    if (errorMessage) console.error("handlePromptError: " + errorMessage);
  };

  const loadGoogleApi = new Promise<types.Google>((resolve) => {
    const isRunningInBrowser = typeof window !== "undefined";

    if (!(!isGoogleApiLoaded.value && isRunningInBrowser)) return;

    const script = document.createElement("script");
    script.addEventListener("load", () => {
      isGoogleApiLoaded.value = true;
      resolve(window.google);
    });
    script.src = config.library;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });

  const googleSdkLoaded = (callback: () => void) => {
    if (isGoogleApiLoaded.value) {
      callback();
      return;
    }
    loadGoogleApi.then(() => callback());
  };

  return {
    isGoogleApiLoaded,
    init,
    googleOneTap,
    googleSdkLoaded,
    loadGoogleApi,
  };
}
