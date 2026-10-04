jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "user-1" } }),
}));

jest.mock("@/lib/firebase/client", () => ({
  app: {},
  db: {},
}));

const getMessaging = jest.fn(() => ({}));
const getToken = jest.fn();
const onMessage = jest.fn(() => jest.fn());

jest.mock("firebase/messaging", () => ({
  getMessaging: (...args: unknown[]) => getMessaging(...args),
  getToken: (...args: unknown[]) => getToken(...args),
  onMessage: (...args: unknown[]) => onMessage(...args),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
}));

import { render } from "@testing-library/react";
import PushNotificationManager from "@/components/system/PushNotificationManager";

describe("PushNotificationManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(global.navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn(),
      },
    });

    Object.defineProperty(global, "Notification", {
      configurable: true,
      value: {
        requestPermission: jest.fn().mockResolvedValue("granted"),
      },
    });
  });

  it("does not register the deleted Firebase messaging worker", () => {
    render(<PushNotificationManager />);

    expect(navigator.serviceWorker.register).not.toHaveBeenCalledWith(
      "/firebase-messaging-sw.js",
    );
  });
});
