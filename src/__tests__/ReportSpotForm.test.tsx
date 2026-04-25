import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReportSpotForm from "@/components/ReportSpotForm";

describe("ReportSpotForm", () => {
  const noop = async () => {};

  it("renders the form", () => {
    render(
      <ReportSpotForm latitude={40.7} longitude={-74.0} onSubmit={noop} />,
    );
    expect(screen.getByTestId("report-spot-form")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit report/i }),
    ).toBeInTheDocument();
  });

  it("submit button is disabled when no location is provided", () => {
    render(<ReportSpotForm onSubmit={noop} />);
    expect(
      screen.getByRole("button", { name: /submit report/i }),
    ).toBeDisabled();
  });

  it("shows error when onSubmit rejects", async () => {
    const failingSubmit = async () => {
      throw new Error("Network error");
    };
    render(
      <ReportSpotForm
        latitude={40.7}
        longitude={-74.0}
        onSubmit={failingSubmit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Network error"),
    );
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(
      <ReportSpotForm
        latitude={40.7}
        longitude={-74.0}
        onSubmit={noop}
        onCancel={onCancel}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("hides cost field for free parking", () => {
    render(
      <ReportSpotForm latitude={40.7} longitude={-74.0} onSubmit={noop} />,
    );
    // Default is paid, so cost field should be visible
    expect(screen.getByLabelText(/cost per hour/i)).toBeInTheDocument();

    // Toggle to free
    fireEvent.click(screen.getByRole("switch"));
    expect(screen.queryByLabelText(/cost per hour/i)).not.toBeInTheDocument();
  });

  it("calls onSubmit with correct payload", async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <ReportSpotForm
        latitude={40.7128}
        longitude={-74.006}
        onSubmit={handleSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/cost per hour/i), {
      target: { value: "2.50" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit report/i }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
    const payload = handleSubmit.mock.calls[0][0];
    expect(payload.latitude).toBe(40.7128);
    expect(payload.longitude).toBe(-74.006);
    expect(payload.address).toBe("123 Main St");
    expect(payload.is_free).toBe(false);
    expect(payload.cost_per_hour).toBe(2.5);
  });
});
