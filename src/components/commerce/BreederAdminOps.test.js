import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AuthContext } from "../auth/authcontext";
import AdminReservationOps from "./AdminReservationOps";
import BreederReservationsPage from "./BreederReservationsPage";

jest.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}), { virtual: true });


describe("breeder and admin commerce ops", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = (options.method || "GET").toUpperCase();
      const ok = (data) =>
        Promise.resolve({
          ok: true,
          json: async () => ({ data }),
        });

      if (url.includes("/marketplace/reservations/incoming/") && method === "GET") {
        return ok({
          feature_d_badges: [{ code: "trusted_seller", name: "Trusted Seller", description: "Clean reservation history." }],
          reservations: [
            {
              id: 51,
              reservation_code: "RES-51",
              species_name: "Mandarin Dragonet",
              pricing_mode: "quote_required",
              subtotal: "0.00",
              delivery_cost: "0.00",
              total_amount: "0.00",
              line_items: [{ label: "Quoted selection", quantity: 1, unit_price: null }],
              buyer: { name: "Buyer Two", username: "buyer2" },
              status: "quote_pending",
              payment_status: "not_started",
              delivery_method: "delivery_quote",
            },
            {
              id: 52,
              reservation_code: "RES-52",
              species_name: "Goldfish",
              pricing_mode: "single_fixed",
              subtotal: "42.00",
              delivery_cost: "0.00",
              total_amount: "42.00",
              buyer: { name: "Buyer Three", username: "buyer3" },
              status: "ready_for_collection",
              payment_status: "paid",
              delivery_method: "collect",
              collection_code: "ABC123",
              pickup_window_expires_at: "2026-05-01T09:00:00Z",
            },
          ],
          metrics: { total: 2, no_show: 0 },
        });
      }

      if (url.includes("/marketplace/breeders/me/connect/") && method === "GET") {
        return ok({ seller_profile: { stripe_connect_status: "pending", payouts_enabled: false } });
      }

      if (url.includes("/marketplace/breeders/me/connect/") && method === "POST") {
        return ok({ payouts_enabled: true, stripe_connect_status: "active" });
      }

      if (url.includes("/marketplace/breeders/me/verification/") && method === "GET") {
        return ok({ verification: { status: "pending" } });
      }

      if (url.includes("/marketplace/breeders/me/verification/") && method === "POST") {
        return ok({ verification: { id: 11, status: "pending" } });
      }

      if (url.includes("/marketplace/breeders/me/earnings/") && method === "GET") {
        return ok({ gross_total: "0.00", commission_total: "0.00", net_total: "0.00", payout_schedule: "Weekly" });
      }

      if (url.includes("/marketplace/breeders/me/species/") && method === "GET") {
        return ok({ species: [], low_stock_alerts: [] });
      }

      if (url.includes("/marketplace/reservations/51/quote/") && method === "POST") {
        return ok({ reservation: { id: 51, status: "quote_received" } });
      }

      if (url.includes("/marketplace/reservations/52/collection/scan/") && method === "POST") {
        return ok({ reservation: { id: 52, status: "completed" } });
      }

      if (url.includes("/marketplace/reservations/52/no-show/") && method === "POST") {
        return ok({ reservation: { id: 52, status: "no_show" } });
      }

      if (url.includes("/marketplace/admin/reservations/dashboard/") && method === "GET") {
        return ok({
          active_reservations: 3,
          completed_reservations: 5,
          dispute_open_count: 1,
          pending_verifications: [{ id: 4, licence_number: "LIC-123", issuing_authority: "Council" }],
          disputes: [{ id: 8, reservation_code: "RES-8", reason: "wrong_species", status: "open", buyer_username: "buyer", seller_username: "breeder", description: "Wrong fish sent." }],
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
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  test("breeder can complete connect, submit a structured quote, and confirm collection", async () => {
    render(
      <AuthContext.Provider value={{ token: "seller-token" }}>
        <BreederReservationsPage />
      </AuthContext.Provider>,
    );

    await waitFor(() => expect(screen.getByText("Complete Stripe Connect")).toBeInTheDocument());
    expect(screen.getByText("Trusted Seller")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Complete Stripe Connect"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/breeders/me/connect/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );

    fireEvent.change(screen.getByLabelText("Fish price"), { target: { value: "79.99" } });
    fireEvent.change(screen.getByLabelText("Shipping cost"), { target: { value: "14.99" } });
    fireEvent.click(screen.getByText("Submit quote"));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/reservations/51/quote/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );

    fireEvent.change(screen.getByLabelText("Scan / enter collection code"), { target: { value: "ABC123" } });
    fireEvent.click(screen.getByText("Confirm collection"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/reservations/52/collection/scan/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );
  });

  test("admin can approve verifications and resolve disputes", async () => {
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
  });
});
