import { reactive, ref } from "vue";
import config from "./config";
import {
  Configuration,
  CredentialPopupResponse,
  Google,
  PromptNotification,
} from "./types";

const clientId = ref("");
const libraryState = reactive({
  apiLoaded: false,
  apiLoadIntitited: false,
});

export function useGoogleOAuth() {
  const init = (client_id: string) => {
    if (!client_id) throw new Error("Client ID is required!");

    clientId.value = client_id;

    loadGoogleApi.then(() => {
      if (!client_id) return;

      const config: Configuration = {
        client_id,
      };

      window.google.accounts.id.initialize(config);
      window.google.accounts.id.prompt();
    });
  };

  const googleSdkLoaded = (callback: () => void) => {
    if (libraryState.apiLoaded) {
      callback();
      return;
    }
    loadGoogleApi.then(() => {
      callback();
    });
  };

  const googleOneTap = (
    client_id?: string
  ): Promise<CredentialPopupResponse> => {
    if (client_id) clientId.value = client_id;

    if (!clientId.value) throw new Error("Client ID is required!");

    return new Promise((resolve, reject) => {
      const config: Configuration = {
        client_id: clientId.value,
        callback: (response: CredentialPopupResponse) => {
          if (response.credential) resolve(response);

          reject(response);
        },
      };

      googleSdkLoaded(() => {
        window.google.accounts.id.initialize(config);
        window.google.accounts.id.prompt((notification: PromptNotification) => {
          handlePromptError(notification);
        });
      });
    });
  };

  const loadGoogleApi = new Promise<Google>((resolve) => {
    const isRunningInBrowser = typeof window !== "undefined";

    if (!(!libraryState.apiLoadIntitited && isRunningInBrowser)) return;

    const script = document.createElement("script");
    libraryState.apiLoadIntitited = true;
    script.addEventListener("load", () => {
      libraryState.apiLoaded = true;
      resolve(window.google);
    });
    script.src = config.library;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });

  const handlePromptError = (notification: PromptNotification) => {
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

    console.error(errorMessage);
  };

  return { init, googleOneTap };
}
