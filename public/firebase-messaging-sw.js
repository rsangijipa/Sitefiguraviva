importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

// These are injected by the build or need to match client.ts
// Usually better to use the same config
const firebaseConfig = {
  apiKey: "env-injected-at-runtime-usually-but-static-works-for-sw",
  authDomain: "figuraviva.firebaseapp.com",
  projectId: "figuraviva",
  storageBucket: "figuraviva.appspot.com",
  messagingSenderId: "env-id",
  appId: "env-id",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/assets/logo.jpeg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
