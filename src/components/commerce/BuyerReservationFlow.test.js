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
          },
          species: [
            {
              id: 21,
              title: "Electric Blue Ram Pair",
              species_name: "Electric Blue Ram",
              base_price: "42.00",
              listed_quantity: 3,
              status: "active",
              supports_collection: true,
              supports_delivery_quote: true,
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
          reservations: [
            {
              id: 99,
              reservation_code: "RES-QUOTE",
              species_name: "Blue Acara",
              total_amount: "55.00",
              delivery_method: "delivery_quote",
              status: "quote_received",
              payment_status: "not_started",
              active_quote: {
                id: 7,
                shipping_cost: "10.00",
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

  test("buyer can start a breeder reservation from the species page", async () => {
    render(
      <AuthContext.Provider value={authValue}>
        <BreederSpeciesPage />
      </AuthContext.Provider>,
    );

    await waitFor(() => expect(screen.getByText(/Electric Blue Ram Pair/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText("Reserve"));
    fireEvent.click(screen.getByText("Reserve for Collection"));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/reservations?highlight=88"));
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/marketplace/listings/21/reserve/"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("buyer can accept a delivery quote from my reservations", async () => {
    render(
      <AuthContext.Provider value={authValue}>
        <MyReservationsPage />
      </AuthContext.Provider>,
    );

    await waitFor(() => expect(screen.getByText(/Blue Acara/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText("Accept quote"));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/reservations/99/quote/accept/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );
  });
});
