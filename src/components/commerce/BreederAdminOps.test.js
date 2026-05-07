import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AuthContext } from "../auth/authcontext";
import AdminReservationOps from "./AdminReservationOps";
import BreederReservationsPage from "./BreederReservationsPage";


jest.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}), { virtual: true });


function ok(data) {
  return Promise.resolve({
    ok: true,
    json: async () => ({ data }),
  });
}


describe("breeder and admin v4 commerce ops", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("breeder can open connect, manage holiday mode, bulk-list stock, and dispatch reservations with tracking", async () => {
    jest.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = (options.method || "GET").toUpperCase();

      if (url.includes("/marketplace/reservations/incoming/") && method === "GET") {
        return ok({
          feature_d_badges: [{ code: "trusted_seller", name: "Trusted Seller", description: "Clean reservation history." }],
          reservations: [
            {
              id: 51,
              reservation_code: "AQA-2605-000051",
              species_name: "Mandarin Dragonet",
              subtotal: "79.99",
              total_amount: "94.98",
              line_items: [{ title: "Mandarin Dragonet", quantity: 1, size_tier: "L" }],
              buyer: { name: "Buyer Two", username: "buyer2" },
              status: "awaiting_dispatch",
              payment_status: "paid",
              delivery_method: "delivery",
              dispute_risk: { risk_level: "medium", risk_score: 0.42 },
            },
            {
              id: 52,
              reservation_code: "AQA-2605-000052",
              species_name: "Goldfish",
              subtotal: "42.00",
              total_amount: "42.00",
              line_items: [{ title: "Goldfish", quantity: 1 }],
              buyer: { name: "Buyer Three", username: "buyer3" },
              status: "payment_pending",
              payment_status: "paid",
              delivery_method: "collect",
            },
          ],
          metrics: { total: 2, no_show: 0 },
        });
      }

      if (url.includes("/marketplace/breeders/me/shipping-profile/") && method === "GET") {
        return ok({
          shipping_profile: {
            holiday_mode_enabled: false,
            holiday_message: "",
            delivery_enabled: true,
          },
        });
      }

      if (url.includes("/marketplace/breeders/me/shipping-profile/") && method === "PATCH") {
        return ok({
          shipping_profile: {
            holiday_mode_enabled: true,
            holiday_message: "Back on Monday.",
            delivery_enabled: true,
          },
        });
      }

      if (url.includes("/marketplace/breeders/me/connect/") && method === "GET") {
        return ok({ seller_profile: { stripe_connect_status: "pending", payouts_enabled: false } });
      }

      if (url.includes("/marketplace/breeders/me/connect/") && method === "POST") {
        return ok({ seller_profile: { stripe_connect_status: "active", payouts_enabled: true } });
      }

      if (url.includes("/marketplace/breeders/me/verification/") && method === "GET") {
        return ok({ verification: { status: "pending" } });
      }

      if (url.includes("/marketplace/breeders/me/earnings/") && method === "GET") {
        return ok({ gross_volume: "1240.00", net_earnings: "1120.00" });
      }

      if (url.includes("/marketplace/breeders/me/species/") && method === "GET") {
        return ok({
          species: [
            {
              id: "stock-1",
              title: "Mandarin Dragonet",
              quantity: 2,
              category: "marine_fish",
              is_visible_on_marketplace: true,
            },
          ],
          low_stock_alerts: [],
        });
      }

      if (url.includes("/marketplace/breeders/me/species/bulk-visibility/") && method === "PATCH") {
        return ok({ success: true });
      }

      if (url.includes("/marketplace/reservations/51/dispatch/") && method === "POST") {
        return ok({ reservation: { id: 51, status: "dispatched" } });
      }

      if (url.includes("/marketplace/reservations/52/collection/ready/") && method === "POST") {
        return ok({ reservation: { id: 52, status: "ready_for_collection" } });
      }

      return ok({});
    });

    render(
      <AuthContext.Provider value={{ token: "seller-token" }}>
        <BreederReservationsPage />
      </AuthContext.Provider>,
    );

    await waitFor(() => expect(screen.getByText("Open Stripe Connect")).toBeInTheDocument());
    expect(screen.getByText("Trusted Seller")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Open Stripe Connect"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/breeders/me/connect/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );

    fireEvent.change(screen.getByPlaceholderText(/Tell buyers when checkout will reopen/i), { target: { value: "Back on Monday." } });
    fireEvent.click(screen.getByText("Enable holiday mode"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/breeders/me/shipping-profile/"),
        expect.objectContaining({ method: "PATCH" }),
      ),
    );

    fireEvent.click(screen.getByText("List all"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/breeders/me/species/bulk-visibility/"),
        expect.objectContaining({ method: "PATCH" }),
      ),
    );

    fireEvent.click(screen.getByText("Mark ready for collection"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/reservations/52/collection/ready/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );

    fireEvent.change(screen.getByLabelText("Tracking number"), { target: { value: "TRACK-51" } });
    fireEvent.change(screen.getByLabelText("Courier"), { target: { value: "DPD" } });
    fireEvent.click(screen.getByText("Mark dispatched"));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/reservations/51/dispatch/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );
  });

  test("admin can approve verifications, resolve disputes, and toggle breeder delivery", async () => {
    jest.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = (options.method || "GET").toUpperCase();

      if (url.includes("/marketplace/admin/reservations/dashboard/") && method === "GET") {
        return ok({
          active_reservations: 3,
          completed_reservations: 5,
          dispute_open_count: 1,
          pending_verifications: [{ id: 4, licence_number: "LIC-123", issuing_authority: "Council" }],
          disputes: [{ id: 8, reservation_code: "AQA-2605-000008", reason: "wrong_species", status: "open", buyer_username: "buyer", seller_username: "breeder", description: "Wrong fish sent." }],
          connect_monitor: [{ seller_id: "seller-1", seller_username: "breeder", stripe_connect_status: "pending", payouts_enabled: false, delivery_sales_enabled: false }],
        });
      }

      if (url.includes("/marketplace/admin/verifications/4/review/") && method === "POST") {
        return ok({ verification: { id: 4, status: "approved" } });
      }

      if (url.includes("/marketplace/admin/disputes/8/resolve/") && method === "POST") {
        return ok({ dispute: { id: 8, status: "resolved" } });
      }

      if (url.includes("/marketplace/admin/breeders/seller-1/delivery-toggle/") && method === "POST") {
        return ok({ delivery_sales_enabled: true });
      }

      return ok({});
    });

    render(<AdminReservationOps token="admin-token" />);

    await waitFor(() => expect(screen.getByText(/Licence Verification Queue/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/admin/verifications/4/review/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );

    fireEvent.click(screen.getByText("Refund buyer"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/admin/disputes/8/resolve/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );

    fireEvent.click(screen.getByText("Unlock delivery"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/admin/breeders/seller-1/delivery-toggle/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );
  });
});
