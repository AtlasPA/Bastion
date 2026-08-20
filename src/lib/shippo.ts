// Shippo REST client for buying shipping labels. Active only when
// SHIPPO_API_TOKEN and the SHIP_FROM_* address are configured.

const API = "https://api.goshippo.com";

export function shippoConfigured(): boolean {
  return Boolean(
    process.env.SHIPPO_API_TOKEN &&
      process.env.SHIP_FROM_STREET1 &&
      process.env.SHIP_FROM_CITY &&
      process.env.SHIP_FROM_STATE &&
      process.env.SHIP_FROM_ZIP
  );
}

async function shippo(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${process.env.SHIPPO_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Shippo ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export type BoughtLabel = {
  transactionId: string;
  labelUrl: string;
  trackingNumber: string;
  carrier: string;
  amountCents: number;
};

/**
 * Creates a shipment for the order's address, picks the cheapest rate,
 * and buys the label. Returns label PDF URL + tracking number.
 */
export async function buyCheapestLabel(input: {
  name: string;
  street1: string;
  street2?: string | null;
  city: string;
  state: string;
  zip: string;
  weightOz: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
}): Promise<BoughtLabel> {
  const shipment = await shippo("/shipments/", {
    address_from: {
      name: process.env.SHIP_FROM_NAME ?? "Bastion GameVault",
      street1: process.env.SHIP_FROM_STREET1,
      street2: process.env.SHIP_FROM_STREET2 ?? "",
      city: process.env.SHIP_FROM_CITY,
      state: process.env.SHIP_FROM_STATE,
      zip: process.env.SHIP_FROM_ZIP,
      country: "US",
      phone: process.env.SHIP_FROM_PHONE ?? "",
      email: process.env.SHIP_FROM_EMAIL ?? "",
    },
    address_to: {
      name: input.name,
      street1: input.street1,
      street2: input.street2 ?? "",
      city: input.city,
      state: input.state,
      zip: input.zip,
      country: "US",
    },
    parcels: [
      {
        length: String(input.lengthIn),
        width: String(input.widthIn),
        height: String(input.heightIn),
        distance_unit: "in",
        weight: String(input.weightOz),
        mass_unit: "oz",
      },
    ],
    async: false,
  });

  const rates = (shipment.rates ?? []) as {
    object_id: string;
    amount: string;
    provider: string;
    servicelevel: { name: string };
  }[];
  if (rates.length === 0) {
    throw new Error(
      `No shipping rates returned. Address may be invalid. ${JSON.stringify(shipment.messages ?? [])}`
    );
  }
  const cheapest = rates.reduce((a, b) =>
    parseFloat(a.amount) <= parseFloat(b.amount) ? a : b
  );

  const tx = await shippo("/transactions/", {
    rate: cheapest.object_id,
    label_file_type: "PDF",
    async: false,
  });
  if (tx.status !== "SUCCESS") {
    throw new Error(
      `Label purchase failed: ${JSON.stringify(tx.messages ?? tx.status)}`
    );
  }

  return {
    transactionId: tx.object_id,
    labelUrl: tx.label_url,
    trackingNumber: tx.tracking_number,
    carrier: `${cheapest.provider} ${cheapest.servicelevel.name}`,
    amountCents: Math.round(parseFloat(cheapest.amount) * 100),
  };
}
