import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AuthContext } from "../auth/authcontext";
import BasketCheckoutPage from "./BasketCheckoutPage";
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


function renderWithAuth(element) {
  return render(<AuthContext.Provider value={authValue}>{element}</AuthContext.Provider>);
}


function ok(data) {
  return Promise.resolve({
    ok: true,
    json: async () => ({ data }),
  });
}


describe("buyer v4 breeder commerce flow", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("buyer can replace a cross-breeder basket and continue to the canonical checkout", async () => {
    jest.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = (options.method || "GET").toUpperCase();
      const body = options.body ? JSON.parse(options.body) : {};

      if (url.includes("/marketplace/breeders/seller-1/species/") && method === "GET") {
        return ok({
          seller_profile: {
            name: "Breeder One",
            username: "breeder1",
            rating: 4.8,
            feature_d_badges: [{ code: "verified_breeder", name: "Verified Breeder", description: "Connect plus licence approved." }],
          },
          shipping_profile: {
            delivery_enabled: true,
            opening_hours: {
              monday: { open: "09:00", close: "17:00" },
            },
          },
          categories: ["freshwater_fish"],
          checkout_blocked: false,
          species: [
            {
              id: "stock-21",
              title: "Electric Blue Ram Pair",
              species_name: "Electric Blue Ram",
              category: "freshwater_fish",
              pricing_mode: "tiered",
              quantity: 3,
              price_min: "10.00",
              price_max: "15.00",
              tier_prices: { S: "10.00", M: "12.50", L: "15.00" },
            },
          ],
        });
      }

      if (url.includes("/marketplace/basket/") && method === "GET") {
        return ok({
          basket: {
            id: 12,
            item_count: 1,
            subtotal: "8.00",
            breeder: { name: "Existing Breeder", username: "existing-breeder" },
          },
        });
      }

      if (url.includes("/marketplace/basket/items/") && method === "POST") {
        if (body.force_replace) {
          return ok({
            basket: {
              id: 13,
              item_count: 2,
              subtotal: "22.50",
              breeder: { name: "Breeder One", username: "breeder1" },
            },
          });
        }
        return ok({
          conflict: true,
          existing_breeder: { name: "Existing Breeder", username: "existing-breeder" },
          incoming_breeder: { name: "Breeder One", username: "breeder1" },
        });
      }

      return ok({});
    });

    renderWithAuth(<BreederSpeciesPage />);

    await waitFor(() => expect(screen.getByText(/Electric Blue Ram Pair/i)).toBeInTheDocument());
    expect(screen.getByText("Verified Breeder")).toBeInTheDocument();

    const plusButtons = screen.getAllByText("+");
    fireEvent.click(plusButtons[0]);
    fireEvent.click(screen.getByText("Add selected sizes"));

    await waitFor(() => expect(screen.getByText(/Replace basket/i)).toBeInTheDocument());
    expect(screen.getByText(/Your basket already belongs to Existing Breeder/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Replace basket"));

    await waitFor(() => expect(screen.getByText(/2 item\(s\) from Breeder One/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText("Go to checkout"));
    expect(mockNavigate).toHaveBeenCalledWith("/marketplace/checkout");
  });

  test("buyer can create and complete the single canonical checkout", async () => {
    window.localStorage.setItem(
      "aquaai.featured.lastAddress",
      JSON.stringify({
        address: "12 Reef Street",
        city: "London",
        state: "Greater London",
        postal_code: "SW1A 1AA",
        country: "UK",
      }),
    );

    jest.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = (options.method || "GET").toUpperCase();

      if (url.includes("/marketplace/basket/") && method === "GET") {
        return ok({
          basket: {
            id: 91,
            item_count: 2,
            subtotal: "34.50",
            breeder: { name: "Breeder One", username: "breeder1" },
            items: [
              { id: 1, title: "Electric Blue Ram", species_name: "Electric Blue Ram", quantity: 1, size_tier: "M", line_total: "12.50" },
              { id: 2, title: "Corydoras Trio", species_name: "Corydoras", quantity: 1, line_total: "22.00" },
            ],
          },
        });
      }

      if (url.includes("/marketplace/checkout/") && !url.includes("/complete/") && method === "POST") {
        return ok({
          reservation: {
            id: 501,
            reservation_code: "AQA-2605-000501",
            status: "payment_pending",
            total_amount: "41.50",
            payment_session_url: "https://checkout.stripe.mock/session/abc",
          },
        });
      }

      if (url.includes("/marketplace/checkout/complete/") && method === "POST") {
        return ok({
          reservation: {
            id: 501,
            reservation_code: "AQA-2605-000501",
            status: "awaiting_dispatch",
            total_amount: "41.50",
            payment_session_url: "https://checkout.stripe.mock/session/abc",
          },
        });
      }

      return ok({});
    });

    renderWithAuth(<BasketCheckoutPage />);

    await waitFor(() => expect(screen.getByText(/Breeder: Breeder One/i)).toBeInTheDocument());
    expect(screen.getByDisplayValue("12 Reef Street")).toBeInTheDocument();
    expect(screen.getByDisplayValue("London")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Fulfilment method"), { target: { value: "delivery" } });
    fireEvent.click(screen.getByText("Go to checkout"));

    await waitFor(() => expect(screen.getByText(/Reservation AQA-2605-000501/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText("Complete checkout"));

    await waitFor(() => expect(screen.getByText(/awaiting_dispatch/i)).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/marketplace/checkout/complete/"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("buyer can confirm receipt and raise a dispute from my reservations", async () => {
    jest.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = (options.method || "GET").toUpperCase();

      if (url.includes("/marketplace/reservations/mine/") && method === "GET") {
        return ok({
          feature_d_badges: [{ code: "reservation_master", name: "Reservation Master", description: "Five clean purchases." }],
          reservations: [
            {
              id: 99,
              reservation_code: "AQA-2605-000099",
              species_name: "Blue Acara",
              subtotal: "45.00",
              delivery_cost: "10.00",
              total_amount: "55.00",
              delivery_method: "delivery",
              status: "dispatched",
              payment_status: "paid",
              courier: "Royal Mail",
              tracking_number: "TRACK-123",
              dispute_risk: { risk_level: "low", risk_score: 0.12 },
              line_items: [{ title: "Blue Acara", quantity: 2, line_total: "45.00" }],
            },
          ],
        });
      }

      if (url.includes("/marketplace/reservations/99/receipt/confirm/") && method === "POST") {
        return ok({ reservation: { id: 99, status: "completed" } });
      }

      if (url.includes("/marketplace/reservations/99/dispute/") && method === "POST") {
        return ok({ dispute: { id: 7, status: "open" } });
      }

      return ok({});
    });

    renderWithAuth(<MyReservationsPage />);

    await waitFor(() => expect(screen.getByText("Reservation Master")).toBeInTheDocument());
    expect(screen.getByText(/Royal Mail/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /received it/i }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/reservations/99/receipt/confirm/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );

    fireEvent.click(screen.getByText("Open dispute"));
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Fish arrived with visible fin damage." } });
    fireEvent.click(screen.getByText("Submit dispute"));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/marketplace/reservations/99/dispute/"),
        expect.objectContaining({ method: "POST" }),
      ),
    );
  });
});
