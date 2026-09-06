import { CONSENT_STORAGE_KEY } from "@/lib/consent.constants";

const getAnalytics = jest.fn();
const logEvent = jest.fn();
const isSupported = jest.fn().mockResolvedValue(true);

jest.mock("firebase/analytics", () => ({
  getAnalytics,
  logEvent,
  isSupported,
}));

jest.mock("@/lib/firebase/client", () => ({
  app: {},
}));

describe("telemetry", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("does not initialize Firebase Analytics when consent is granted", async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");

    await import("@/lib/telemetry");

    expect(getAnalytics).not.toHaveBeenCalled();
    expect(isSupported).not.toHaveBeenCalled();
    expect(logEvent).not.toHaveBeenCalled();
  });
});
