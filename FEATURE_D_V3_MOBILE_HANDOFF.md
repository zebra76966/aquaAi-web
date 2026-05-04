# Feature D v3 Mobile Handoff

This handoff maps the current Feature D v3 backend contract onto the buyer and breeder mobile surfaces.

## Buyer screens

### Marketplace listing detail

Use these fields from listing detail:

- `is_breeder_listing`
- `buy_button_label`
- `pricing_mode`
- `display_price`
- `tier_prices`
- `price_range`
- `bid_conversion_banner`

Routing rule:

- breeder listing -> breeder species page
- non-breeder listing -> existing marketplace flow

### Breeder species page

Three interaction modes:

- `single_fixed`
  - quantity picker
  - collect or delivery-quote selector
- `tiered`
  - S/M/L counters
  - live subtotal from `tier_prices`
  - collect or delivery-quote selector
- `quote_required`
  - quantity picker
  - preference note
  - request quote instead of direct pricing

API:

- `POST /api/v1/marketplace/listings/<listing_id>/reserve/`

### My Reservations

Surface the following per reservation:

- `pricing_mode`
- `line_items`
- `subtotal`
- `delivery_cost`
- `total_amount`
- `platform_fee`
- `status`
- `payment_status`
- `active_quote`
- `pickup_window_expires_at`
- `collection_code`
- `tracking_number`
- `courier_name`
- `no_show_fee`

Primary actions by state:

- `quote_received` -> accept / decline quote
- `payment_pending` -> payment sheet
- `ready_for_collection` -> show QR / code only
- `dispatched` -> confirm receipt
- `paid` and not disputed/cancelled/no_show -> open dispute

### Disputes

Allowed categories:

- `doa`
- `wrong_species`
- `late_delivery`
- `disease_introduction`
- `other`

Do not expose `tier_mismatch`.

## Breeder screens

### Incoming reservations

Display:

- buyer identity
- reservation code
- pricing mode
- delivery method
- line item mix
- totals
- quote expiry

Actions:

- `quote_pending`
  - submit quote
- `ready_for_collection`
  - scan / enter `collection_code`
  - call `/collection/scan/`
  - show `Mark no-show` after `pickup_window_expires_at`
- `awaiting_dispatch`
  - enter `tracking_number`
  - enter `courier`
  - mark dispatched
- open dispute response if dispute exists

### Quote composition rules

Use `quote_type`:

- `delivery_only`
- `fish_only`
- `fish_and_delivery`

Suggested mapping:

- fixed/tiered + delivery -> `delivery_only`
- quote-required + collect -> `fish_only`
- quote-required + delivery -> `fish_and_delivery`

## Collection flow

Buyer side:

- render QR based on `collection_code`
- also show plaintext fallback code

Breeder side:

- scan QR or enter code manually
- call `POST /api/v1/marketplace/reservations/<reservation_id>/collection/scan/`

## No-show flow

Only breeder triggers it.

Rules:

- collection only
- reservation must still be `ready_for_collection`
- pickup window must have expired

Endpoint:

- `POST /api/v1/marketplace/reservations/<reservation_id>/no-show/`

Result fields to display to buyer:

- `status = no_show`
- `no_show_fee`

## Payments

Current contract exposes:

- `payment_session_url`
- `available_payment_methods`

Use the same reservation states as the current web flow:

- request quote or reserve
- accept quote if needed
- launch payment
- call completion endpoint after successful payment

## Verified in the current implementation

Automated coverage already passes for:

- buyer tiered reserve flow
- buyer structured quote acceptance
- breeder structured quote submission
- breeder collection confirmation
- backend tiered pricing maths
- backend quote-required no-show flow
- intelligence reservation event signals
