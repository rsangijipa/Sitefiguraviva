"use client";

import { useEffect, useState } from "react";
import { app, db } from "@/lib/firebase/client";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export default function PushNotificationManager() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;

    const requestPermission = async () => {
      try {
        const messaging = getMessaging(app);

        // Register service worker if not already registered
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
          );
          console.log("SW registered with scope:", registration.scope);
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const fcmToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, // You need this!
          });

          if (fcmToken) {
            setToken(fcmToken);
            // Save token to user doc
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
              fcmTokens: arrayUnion(fcmToken),
            });
            console.log("FCM Token saved:", fcmToken);
          }
        }
      } catch (error) {
        console.error("Unable to get messaging token.", error);
      }
    };

    requestPermission();

    // Listen for foreground messages
    const messaging = getMessaging(app);
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received in foreground: ", payload);
      // You can show a custom toast here
    });

    return () => unsubscribe();
  }, [user]);

  return null; // Side effect component
}
