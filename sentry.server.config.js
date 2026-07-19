import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://997b8728a7bb26a2ec4b140059d13055@o4511755467948032.ingest.us.sentry.io/4511755473321984",
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/astro/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
  // Define how likely traces are sampled. Adjust this value in production,
  // or use tracesSampler for greater control.
  tracesSampleRate: 1.0,
});