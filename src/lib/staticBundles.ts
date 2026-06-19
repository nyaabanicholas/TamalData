import type { DataBundle } from "@/types";

const make = (
  network: "MTN" | "TELECEL" | "AIRTELTIGO",
  id: string,
  size: string,
  price: number,
  validity = "90 days",
  type: "regular" | "non-expiry" = "regular"
): DataBundle => ({
  id,
  network,
  size,
  price,
  validity,
  type,
  available: true,
});

export const STATIC_BUNDLES: Record<"MTN" | "TELECEL" | "AIRTELTIGO", DataBundle[]> = {
  MTN: [
    make("MTN", "mtn-1gb",  "1GB",  4.60),
    make("MTN", "mtn-2gb",  "2GB",  9.30),
    make("MTN", "mtn-3gb",  "3GB",  13.90),
    make("MTN", "mtn-4gb",  "4GB",  18.90),
    make("MTN", "mtn-5gb",  "5GB",  23.90),
    make("MTN", "mtn-6gb",  "6GB",  27.50),
    make("MTN", "mtn-8gb",  "8GB",  35.80),
    make("MTN", "mtn-10gb", "10GB", 42.90),
    make("MTN", "mtn-15gb", "15GB", 63.00),
    make("MTN", "mtn-20gb", "20GB", 84.00),
    make("MTN", "mtn-25gb", "25GB", 103.50),
    make("MTN", "mtn-30gb", "30GB", 124.00),
    make("MTN", "mtn-40gb", "40GB", 165.00),
    make("MTN", "mtn-50gb", "50GB", 225.00),
  ],
  TELECEL: [
    make("TELECEL", "tcl-10gb",  "10GB",  45.00),
    make("TELECEL", "tcl-15gb",  "15GB",  67.50),
    make("TELECEL", "tcl-20gb",  "20GB",  90.00),
    make("TELECEL", "tcl-25gb",  "25GB",  112.50),
    make("TELECEL", "tcl-30gb",  "30GB",  135.00),
    make("TELECEL", "tcl-35gb",  "35GB",  170.00),
    make("TELECEL", "tcl-40gb",  "40GB",  165.00),
    make("TELECEL", "tcl-50gb",  "50GB",  200.00),
    make("TELECEL", "tcl-100gb", "100GB", 420.00),
  ],
  AIRTELTIGO: [
    make("AIRTELTIGO", "at-1gb",  "1GB",  4.50),
    make("AIRTELTIGO", "at-2gb",  "2GB",  9.00),
    make("AIRTELTIGO", "at-3gb",  "3GB",  14.00),
    make("AIRTELTIGO", "at-4gb",  "4GB",  17.50),
    make("AIRTELTIGO", "at-5gb",  "5GB",  22.00),
    make("AIRTELTIGO", "at-6gb",  "6GB",  26.50),
    make("AIRTELTIGO", "at-8gb",  "8GB",  34.00),
    make("AIRTELTIGO", "at-10gb", "10GB", 42.00),
    make("AIRTELTIGO", "at-12gb", "12GB", 50.50),
    make("AIRTELTIGO", "at-15gb", "15GB", 65.50),
    make("AIRTELTIGO", "at-25gb", "25GB", 105.00),
    make("AIRTELTIGO", "at-40gb", "40GB", 165.00),
    make("AIRTELTIGO", "at-50gb", "50GB", 210.00),
  ],
};

export const ALL_STATIC_BUNDLES: DataBundle[] = [
  ...STATIC_BUNDLES.MTN,
  ...STATIC_BUNDLES.TELECEL,
  ...STATIC_BUNDLES.AIRTELTIGO,
];

export const CHEAPEST_BY_NETWORK = {
  MTN: STATIC_BUNDLES.MTN[0].price,
  TELECEL: STATIC_BUNDLES.TELECEL[0].price,
  AIRTELTIGO: STATIC_BUNDLES.AIRTELTIGO[0].price,
};
