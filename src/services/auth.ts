import { gapi } from "gapi-script";

export const CLIENT_ID = process.env.VITE_GAPI_CLIENT_ID;
export const API_KEY = process.env.VITE_GAPI_API_KEY;

export const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

export const SCOPES = "https://www.googleapis.com/auth/drive.file";

export const initClient = (options: {
  updateLoggedInStatus: (status: boolean) => void;
}) => {
  return gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    })
    .then(() => {
      gapi.auth2
        .getAuthInstance()
        .isSignedIn.listen(options.updateLoggedInStatus);

      options.updateLoggedInStatus(
        gapi.auth2.getAuthInstance().isSignedIn.get()
      );
    })
    .catch((err: Error) => {
      console.error("Caught error", err);
    });
};

export const signIn = (updateLoggedInStatus: (status: boolean) => void) => {
  return gapi.auth2
    .getAuthInstance()
    .signIn()
    .then(() => updateLoggedInStatus(true))
    .catch((error) => console.error("Trouble Logging in !!", error));
};

export const signOut = () => {
  return gapi.auth2.getAuthInstance().signOut();
};
