import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AuthContext } from "../auth/authcontext";
import BreederSpeciesPage from "./BreederSpeciesPage";
import MyReservationsPage from "./MyReservationsPage";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ sellerId: "seller-1" }),
  useSearchParams: () => [new URLSearchParams("")],
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}), { virtual: true });


const authValue = {
  token: "buyer-token",
  activeTankId: 1,
  userProfile: { name: "Buyer One" },
};


describe("buyer reservation commerce flow", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    jest.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = (options.method || "GET").toUpperCase();
      const ok = (data) =>
        Promise.resolve({
          ok: true,
          json: async () => ({ data }),
        });

      if (url.includes("/marketplace/breeders/") && method === "GET") {
        return ok({
          seller_profile: {
            name: "Breeder One",
            username: "breeder1",
            rating: 4.8,
            reviews_count: 12,
            stripe_connect_status: "active",
            verification: { status: "approved" },
            feature_d_badges: [{ code: "verified_breeder", name: "Verified Breeder", description: "Connect plus licence approved." }],
          },
          species: [
            {
              id: 21,
              title: "Electric Blue Ram Pair",
              species_name: "Electric Blue Ram",
              pricing_mode: "tiered",
              display_price: "10.00-15.00",
              listed_quantity: 3,
              status: "active",
              supports_collection: true,
              supports_delivery_quote: true,
              tier_prices: { S: "10.00", M: "12.50", L: "15.00" },
              reserve_button_label: "Reserve tier mix",
            },
          ],
          low_stock_alerts: [],
        });
      }

      if (url.includes("/marketplace/listings/21/reserve/") && method === "POST") {
        return ok({
          reservation: {
            id: 88,
            reservation_code: "RES-123",
            delivery_method: "collect",
            status: "payment_pending",
            payment_session_url: "https://checkout.stripe.mock/session/abc",
          },
        });
      }

      if (url.includes("/marketplace/reservations/mine/") && method === "GET") {
        return ok({
          feature_d_badges: [{ code: "reservation_master", name: "Reservation Master", description: "Five clean purchases." }],
          reservations: [
            {
              id: 99,
              reservation_code: "RES-QUOTE",
              species_name: "Blue Acara",
              pricing_mode: "quote_required",
              subtotal: "45.00",
              delivery_cost: "10.00",
              total_amount: "55.00",
              delivery_method: "delivery_quote",
              status: "quote_received",
              payment_status: "not_started",
              line_items: [{ label: "Quoted selection", quantity: 2, unit_price: "22.50" }],
              active_quote: {
                id: 7,
                quote_type: "fish_and_delivery",
                fish_price: "45.00",
                delivery_cost: "10.00",
                total_amount: "55.00",
                estimated_dispatch_date: "2026-05-08",
                expires_at: "2026-05-09T14:00:00Z",
                note: "Insulated shipping included.",
              },
            },
          ],
        });
      }

      if (url.includes("/marketplace/reservations/99/quote/accept/") && method === "POST") {
        return ok({ reservation: { id: 99, status: "payment_pending" } });
      }

      return ok({});
    });
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  test("buyer can build a tiered reservation from the species page", async () => {
    render(
      <AuthContext.Provider value={authValue}>
        <BreederSpeciesPage />
      </AuthContext.Provider>,
    );

    await waitFor(() => expect(screen.getByText(/Electric Blue Ram Pair/i)).toBeInTheDocument());
    expect(screen.getByText("Verified Breeder")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Reserve tier mix"));
    const buttons = screen.getAllByText("+");
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    expect(screen.getByText("£22.50")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Reserve for Collection"));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/reservations?highlight=88"));
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/marketplace/listings/21/reserve/"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("buyer can accept a structured quote from my reservations", async () => {
    render(
      <AuthContext.Provider value={authValue}>
        <MyReservationsPage />
      </AuthContext.Provider>,
    );

    await waitFor(() => expect(screen.getByText(/Blue Acara/i)).toBeInTheDocument());
    expect(screen.getByText("Reservation Master")).toBeInTheDocument();
    expect(screen.getByText(/fish and delivery/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Accept quote"));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/reservations/99/quote/accept/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );
  });
});
