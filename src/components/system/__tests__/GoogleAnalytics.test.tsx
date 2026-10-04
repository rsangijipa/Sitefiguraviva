import { act, render, waitFor } from "@testing-library/react";
import GoogleAnalytics from "../GoogleAnalytics";
import { resetConsent, setConsent } from "@/lib/consent";
const mockLoader = jest.fn();
jest.mock("next/script", () => ({
  __esModule: true,
  default: (props: any) => {
    mockLoader(props);
    return null;
  },
}));
const analytics = window as any;
beforeEach(() => {
  window.localStorage.clear();
  mockLoader.mockClear();
  delete analytics.gtag;
  delete analytics.dataLayer;
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID = "G-TEST123";
});
afterEach(() => {
  delete process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  delete analytics.gtag;
  delete analytics.dataLayer;
});
it("never loads the tag before consent or on denial", async () => {
  render(<GoogleAnalytics />);
  await waitFor(() => expect(analytics["ga-disable-G-TEST123"]).toBe(true));
  expect(mockLoader).not.toHaveBeenCalled();
  act(() => setConsent("denied"));
  expect(mockLoader).not.toHaveBeenCalled();
});
it("loads only after acceptance and immediately disables on withdrawal", async () => {
  render(<GoogleAnalytics />);
  act(() => setConsent("granted"));
  await waitFor(() => expect(mockLoader).toHaveBeenCalled());
  expect(analytics["ga-disable-G-TEST123"]).toBe(false);
  expect(
    analytics.dataLayer.map((args: ArrayLike<unknown>) => Array.from(args)),
  ).toContainEqual([
    "consent",
    "update",
    expect.objectContaining({
      analytics_storage: "granted",
      ad_storage: "denied",
    }),
  ]);
  document.cookie = "_ga=fixture; Path=/";
  document.cookie = "_ga_TEST123=fixture; Path=/";
  document.cookie = "necessary=keep; Path=/";
  act(() => resetConsent());
  expect(analytics["ga-disable-G-TEST123"]).toBe(true);
  expect(document.cookie).not.toMatch(/_ga=/);
  expect(document.cookie).not.toMatch(/_ga_TEST123=/);
  expect(document.cookie).toContain("necessary=keep");
  act(() => setConsent("granted"));
  expect(analytics["ga-disable-G-TEST123"]).toBe(false);
});
it("rejects an ID that could inject script or load another resource", async () => {
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID = "G-X';alert(1)//";
  window.localStorage.setItem("fv:cookie-consent", "granted");
  render(<GoogleAnalytics />);
  expect(mockLoader).not.toHaveBeenCalled();
});
it("disables loaded analytics when another tab revokes consent", async () => {
  window.localStorage.setItem("fv:cookie-consent", "granted");
  render(<GoogleAnalytics />);
  await waitFor(() => expect(analytics["ga-disable-G-TEST123"]).toBe(false));
  window.localStorage.setItem("fv:cookie-consent", "denied");
  act(() =>
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "fv:cookie-consent",
        newValue: "denied",
      }),
    ),
  );
  expect(analytics["ga-disable-G-TEST123"]).toBe(true);
});

it("preserves denial in memory when preference storage rejects a write", async () => {
  render(<GoogleAnalytics />);
  act(() => setConsent("granted"));
  await waitFor(() => expect(analytics["ga-disable-G-TEST123"]).toBe(false));
  const failedStorage = jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
  try {
    act(() => setConsent("denied"));
    expect(analytics["ga-disable-G-TEST123"]).toBe(true);
  } finally {
    failedStorage.mockRestore();
    act(() => resetConsent());
  }
});
