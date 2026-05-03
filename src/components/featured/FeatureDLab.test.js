import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import FeatureDLab from "./FeatureDLab";
import { AuthContext } from "../auth/authcontext";


const renderWithAuth = (ui, overrides = {}) => {
  const value = {
    token: "token-123",
    activeTankId: 77,
    userProfile: { username: "reefkeeper" },
    ...overrides,
  };

  return render(
    <AuthContext.Provider value={value}>
      {ui}
    </AuthContext.Provider>,
  );
};


describe("FeatureDLab", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = (options.method || "GET").toUpperCase();
      const success = (data) =>
        Promise.resolve({
          ok: true,
          json: async () => ({ data }),
        });

      if (url.includes("/featured/marketplace/compatible-listings/")) {
        return success({
          results: [
            {
              listing_id: 1,
              species_name: "Mandarin Dragonet",
              title: "Mandarin Dragonet Listing",
              seller: "nick",
              base_price: "40.00",
              compatibility_score: 0.78,
              compatibility_level: "medium",
              readiness: "ready_with_adjustments",
              recommended_actions: ["Increase pod population first."],
              supplier_note: "Live listing ranked for the selected habitat.",
            },
          ],
        });
      }

      if (url.includes("/featured/marketplace/purchases/")) {
        return success({
          purchases: [
            {
              purchase_id: 9,
              listing_title: "Blue Ram Pair",
              species_name: "Blue Ram",
              seller: "breeder",
              sold_price: "32.00",
              quarantine_status: "recommended",
              quarantine_protocol: {
                risk_level: "medium",
                summary: "Quarantine for 17 days.",
                instructions: ["Observe appetite", "Test daily", "Avoid cross-contamination"],
              },
            },
          ],
        });
      }

      if (url.includes("/featured/breeder/analytics/")) {
        return success({
          summary: { total_revenue: 120, sold_count: 3 },
          intelligence: { sell_through_rate: 0.6, demand_forecast: "demand_rising", pricing_recommendation: "Hold price." },
        });
      }

      if (url.includes("/featured/breeder/cycles/") && method === "GET") {
        return success({ cycles: [] });
      }

      if (url.includes("/featured/emergency/requests/") && method === "GET") {
        return success({ requests: [] });
      }

      if (url.includes("/featured/emergency/responders/me/") && method === "GET") {
        return success({
          display_name: "",
          responder_type: "hobbyist",
          can_receive_alerts: false,
          service_radius_km: 50,
          specialties: [],
        });
      }

      if (url.includes("/featured/genetics/registry/") && method === "GET") {
        return success({ records: [] });
      }

      if (url.includes("/featured/marketplace/purchases/9/quarantine/") && method === "POST") {
        return success({ purchase_id: 9, quarantine_status: "acknowledged" });
      }

      if (url.includes("/featured/emergency/requests/") && method === "POST") {
        return success({ request_id: 4, matched_responders: [] });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({ data: {} }),
      });
    });
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  test("loads compatibility and quarantine sections", async () => {
    renderWithAuth(<FeatureDLab />);

    await waitFor(() => {
      expect(screen.getAllByText(/Mandarin Dragonet/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Quarantine for 17 days/i)).toBeInTheDocument();
      expect(screen.getByText(/demand_rising/i)).toBeInTheDocument();
    });
  });

  test("can acknowledge quarantine and submit an emergency request", async () => {
    renderWithAuth(<FeatureDLab />);

    await waitFor(() => expect(screen.getByText(/Blue Ram/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText("Acknowledge"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/featured/marketplace/purchases/9/quarantine/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );

    fireEvent.change(screen.getByPlaceholderText(/Emergency title/i), { target: { value: "Pump failure in reef tank" } });
    fireEvent.change(screen.getByPlaceholderText(/What happened/i), { target: { value: "Flow stopped unexpectedly." } });
    fireEvent.click(screen.getByText(/Dispatch emergency request/i));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/featured/emergency/requests/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );
  });
});
