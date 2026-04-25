/**
 * Tests for the useGeolocation hook.
 * We mock navigator.geolocation to control position callbacks.
 */
import { renderHook } from "@testing-library/react";
import { useGeolocation } from "@/hooks/useGeolocation";

const mockWatchPosition = jest.fn();
const mockClearWatch = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
  Object.defineProperty(global.navigator, "geolocation", {
    value: {
      watchPosition: mockWatchPosition,
      clearWatch: mockClearWatch,
    },
    configurable: true,
    writable: true,
  });
});

describe("useGeolocation", () => {
  it("starts in loading state", () => {
    mockWatchPosition.mockImplementation(() => 42); // watchId
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.loading).toBe(true);
    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("resolves with coordinates on success", () => {
    mockWatchPosition.mockImplementation((success: PositionCallback) => {
      success({
        coords: { latitude: 51.505, longitude: -0.09, accuracy: 20 },
        timestamp: Date.now(),
      } as GeolocationPosition);
      return 1;
    });

    const { result } = renderHook(() => useGeolocation());
    expect(result.current.loading).toBe(false);
    expect(result.current.latitude).toBe(51.505);
    expect(result.current.longitude).toBe(-0.09);
    expect(result.current.accuracy).toBe(20);
    expect(result.current.error).toBeNull();
  });

  it("captures geolocation errors", () => {
    mockWatchPosition.mockImplementation(
      (_: PositionCallback, onError: PositionErrorCallback) => {
        onError({ message: "User denied geolocation" } as GeolocationPositionError);
        return 2;
      },
    );

    const { result } = renderHook(() => useGeolocation());
    expect(result.current.loading).toBe(false);
    expect(result.current.latitude).toBeNull();
    expect(result.current.error).toBe("User denied geolocation");
  });

  it("reports error when geolocation is unavailable", () => {
    Object.defineProperty(global.navigator, "geolocation", {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toMatch(/not supported/i);
  });

  it("clears the watch on unmount", () => {
    mockWatchPosition.mockReturnValue(99);
    const { unmount } = renderHook(() => useGeolocation());
    unmount();
    expect(mockClearWatch).toHaveBeenCalledWith(99);
  });
});
