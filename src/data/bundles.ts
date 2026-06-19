import type { Network } from "@/types";
import { ALL_STATIC_BUNDLES } from "@/lib/staticBundles";

export interface BundleDefinition {
  /** Unique ID (sent to DataMart as capacity) */
  id: string;
  /** Internal network */
  network: Network;
  /** DataMart network code */
  dmNetwork: string;
  /** Display size e.g. "1GB", "2GB" */
  size: string;
  /** Validity period */
  validity: string;
  /** Cost price from DataMart (GHS) */
  costPrice: number;
  /** Recommended selling price from cheapdata.shop (GHS) */
  recommendedPrice: number;
  /** Type of bundle */
  type: string;
  /** Capacity in MB (for DataMart API) */
  mb: number;
  /** Capacity in GB */
  gb: number;
}

const VALIDITY_30_DAYS = "30 days";

const MTN_BUNDLES: BundleDefinition[] = [
  { id: "1",     network: "MTN", dmNetwork: "YELLO",         size: "1GB",   validity: VALIDITY_30_DAYS, costPrice: 4.20,  recommendedPrice: 4.60,  type: "DATA", mb: 1024,   gb: 1 },
  { id: "2",     network: "MTN", dmNetwork: "YELLO",         size: "2GB",   validity: VALIDITY_30_DAYS, costPrice: 8.80,  recommendedPrice: 9.30,  type: "DATA", mb: 2048,   gb: 2 },
  { id: "3",     network: "MTN", dmNetwork: "YELLO",         size: "3GB",   validity: VALIDITY_30_DAYS, costPrice: 12.80, recommendedPrice: 13.90, type: "DATA", mb: 3072,   gb: 3 },
  { id: "4",     network: "MTN", dmNetwork: "YELLO",         size: "4GB",   validity: VALIDITY_30_DAYS, costPrice: 17.80, recommendedPrice: 18.90, type: "DATA", mb: 4096,   gb: 4 },
  { id: "5",     network: "MTN", dmNetwork: "YELLO",         size: "5GB",   validity: VALIDITY_30_DAYS, costPrice: 22.30, recommendedPrice: 23.90, type: "DATA", mb: 5120,   gb: 5 },
  { id: "6",     network: "MTN", dmNetwork: "YELLO",         size: "6GB",   validity: VALIDITY_30_DAYS, costPrice: 25.00, recommendedPrice: 27.50, type: "DATA", mb: 6144,   gb: 6 },
  { id: "8",     network: "MTN", dmNetwork: "YELLO",         size: "8GB",   validity: VALIDITY_30_DAYS, costPrice: 33.00, recommendedPrice: 35.80, type: "DATA", mb: 8192,   gb: 8 },
  { id: "10",    network: "MTN", dmNetwork: "YELLO",         size: "10GB",  validity: VALIDITY_30_DAYS, costPrice: 41.00, recommendedPrice: 42.90, type: "DATA", mb: 10240,  gb: 10 },
  { id: "15",    network: "MTN", dmNetwork: "YELLO",         size: "15GB",  validity: VALIDITY_30_DAYS, costPrice: 59.50, recommendedPrice: 63.00, type: "DATA", mb: 15360,  gb: 15 },
  { id: "20",    network: "MTN", dmNetwork: "YELLO",         size: "20GB",  validity: VALIDITY_30_DAYS, costPrice: 79.00, recommendedPrice: 84.00, type: "DATA", mb: 20480,  gb: 20 },
  { id: "25",    network: "MTN", dmNetwork: "YELLO",         size: "25GB",  validity: VALIDITY_30_DAYS, costPrice: 99.00, recommendedPrice: 103.50,type: "DATA", mb: 25600,  gb: 25 },
  { id: "30",    network: "MTN", dmNetwork: "YELLO",         size: "30GB",  validity: VALIDITY_30_DAYS, costPrice: 121.00,recommendedPrice: 124.00, type: "DATA", mb: 30720,  gb: 30 },
  { id: "40",    network: "MTN", dmNetwork: "YELLO",         size: "40GB",  validity: VALIDITY_30_DAYS, costPrice: 158.00,recommendedPrice: 165.00, type: "DATA", mb: 40960,  gb: 40 },
  { id: "50",    network: "MTN", dmNetwork: "YELLO",         size: "50GB",  validity: VALIDITY_30_DAYS, costPrice: 200.00,recommendedPrice: 225.00, type: "DATA", mb: 51200,  gb: 50 },
];

const TELECEL_BUNDLES: BundleDefinition[] = [
  { id: "10",    network: "TELECEL", dmNetwork: "TELECEL",   size: "10GB",  validity: VALIDITY_30_DAYS, costPrice: 38.50, recommendedPrice: 45.00, type: "DATA", mb: 10240,  gb: 10 },
  { id: "15",    network: "TELECEL", dmNetwork: "TELECEL",   size: "15GB",  validity: VALIDITY_30_DAYS, costPrice: 54.85, recommendedPrice: 67.50, type: "DATA", mb: 15360,  gb: 15 },
  { id: "20",    network: "TELECEL", dmNetwork: "TELECEL",   size: "20GB",  validity: VALIDITY_30_DAYS, costPrice: 73.80, recommendedPrice: 90.00, type: "DATA", mb: 20480,  gb: 20 },
  { id: "25",    network: "TELECEL", dmNetwork: "TELECEL",   size: "25GB",  validity: VALIDITY_30_DAYS, costPrice: 90.75, recommendedPrice: 112.50,type: "DATA", mb: 25600,  gb: 25 },
  { id: "30",    network: "TELECEL", dmNetwork: "TELECEL",   size: "30GB",  validity: VALIDITY_30_DAYS, costPrice: 107.70,recommendedPrice: 135.00, type: "DATA", mb: 30720,  gb: 30 },
  { id: "35",    network: "TELECEL", dmNetwork: "TELECEL",   size: "35GB",  validity: VALIDITY_30_DAYS, costPrice: 130.65,recommendedPrice: 170.00, type: "DATA", mb: 35840,  gb: 35 },
  { id: "40",    network: "TELECEL", dmNetwork: "TELECEL",   size: "40GB",  validity: VALIDITY_30_DAYS, costPrice: 142.60,recommendedPrice: 165.00, type: "DATA", mb: 40960,  gb: 40 },
  { id: "50",    network: "TELECEL", dmNetwork: "TELECEL",   size: "50GB",  validity: VALIDITY_30_DAYS, costPrice: 177.50,recommendedPrice: 200.00, type: "DATA", mb: 51200,  gb: 50 },
  { id: "100",   network: "TELECEL", dmNetwork: "TELECEL",   size: "100GB", validity: VALIDITY_30_DAYS, costPrice: 397.00,recommendedPrice: 420.00, type: "DATA", mb: 102400, gb: 100 },
];

const AIRTELTIGO_BUNDLES: BundleDefinition[] = [
  { id: "1",     network: "AIRTELTIGO", dmNetwork: "AT_PREMIUM",   size: "1GB",   validity: VALIDITY_30_DAYS, costPrice: 3.95,  recommendedPrice: 4.50,  type: "DATA", mb: 1024,   gb: 1 },
  { id: "2",     network: "AIRTELTIGO", dmNetwork: "AT_PREMIUM",   size: "2GB",   validity: VALIDITY_30_DAYS, costPrice: 8.35,  recommendedPrice: 9.00,  type: "DATA", mb: 2048,   gb: 2 },
  { id: "3",     network: "AIRTELTIGO", dmNetwork: "AT_PREMIUM",   size: "3GB",   validity: VALIDITY_30_DAYS, costPrice: 13.25, recommendedPrice: 14.00, type: "DATA", mb: 3072,   gb: 3 },
  { id: "4",     network: "AIRTELTIGO", dmNetwork: "AT_PREMIUM",   size: "4GB",   validity: VALIDITY_30_DAYS, costPrice: 16.50, recommendedPrice: 17.50, type: "DATA", mb: 4096,   gb: 4 },
  { id: "5",     network: "AIRTELTIGO", dmNetwork: "AT_PREMIUM",   size: "5GB",   validity: VALIDITY_30_DAYS, costPrice: 19.50, recommendedPrice: 23.50, type: "DATA", mb: 5120,   gb: 5 },
  { id: "6",     network: "AIRTELTIGO", dmNetwork: "AT_PREMIUM",   size: "6GB",   validity: VALIDITY_30_DAYS, costPrice: 23.50, recommendedPrice: 25.00, type: "DATA", mb: 6144,   gb: 6 },
  { id: "8",     network: "AIRTELTIGO", dmNetwork: "AT_PREMIUM",   size: "8GB",   validity: VALIDITY_30_DAYS, costPrice: 30.50, recommendedPrice: 35.50, type: "DATA", mb: 8192,   gb: 8 },
  { id: "10",    network: "AIRTELTIGO", dmNetwork: "AT_PREMIUM",   size: "10GB",  validity: VALIDITY_30_DAYS, costPrice: 38.50, recommendedPrice: 44.00, type: "DATA", mb: 10240,  gb: 10 },
  { id: "12",    network: "AIRTELTIGO", dmNetwork: "AT_PREMIUM",   size: "12GB",  validity: VALIDITY_30_DAYS, costPrice: 45.50, recommendedPrice: 50.50, type: "DATA", mb: 12288,  gb: 12 },
  { id: "15",    network: "AIRTELTIGO", dmNetwork: "AT_PREMIUM",   size: "15GB",  validity: VALIDITY_30_DAYS, costPrice: 57.50, recommendedPrice: 65.50, type: "DATA", mb: 15360,  gb: 15 },
  { id: "25",    network: "AIRTELTIGO", dmNetwork: "AT_PREMIUM",   size: "25GB",  validity: VALIDITY_30_DAYS, costPrice: 95.00, recommendedPrice: 105.00,type: "DATA", mb: 25600,  gb: 25 },
  { id: "40",    network: "AIRTELTIGO", dmNetwork: "AT_PREMIUM",   size: "40GB",  validity: VALIDITY_30_DAYS, costPrice: 151.00,recommendedPrice: 165.00,type: "DATA", mb: 40960,  gb: 40 },
  { id: "50",    network: "AIRTELTIGO", dmNetwork: "AT_PREMIUM",   size: "50GB",  validity: VALIDITY_30_DAYS, costPrice: 190.00,recommendedPrice: 210.00,type: "DATA", mb: 51200,  gb: 50 },
];

/** All bundles indexed by network */
export const BUNDLES_BY_NETWORK: Record<Network, BundleDefinition[]> = {
  MTN: MTN_BUNDLES,
  TELECEL: TELECEL_BUNDLES,
  AIRTELTIGO: AIRTELTIGO_BUNDLES,
};

/** All bundles flat */
export const ALL_BUNDLES: BundleDefinition[] = [
  ...MTN_BUNDLES,
  ...TELECEL_BUNDLES,
  ...AIRTELTIGO_BUNDLES,
];

/** Look up a bundle by its id (optionally filtered by network) */
export function getBundleById(id: string, network?: Network): BundleDefinition | undefined {
  // First, search in the primary bundle definitions (numeric IDs like "1", "2")
  if (network) {
    const found = BUNDLES_BY_NETWORK[network]?.find((b) => b.id === id);
    if (found) return found;
  } else {
    const found = ALL_BUNDLES.find((b) => b.id === id);
    if (found) return found;
  }

  // Fallback: search in static bundles (string IDs like "mtn-1gb", "tcl-10gb")
  // Needed because the buy page frontend sends STATIC_BUNDLES IDs to the order API
  const staticBundle = ALL_STATIC_BUNDLES.find(
    (b) => b.id === id && (network ? b.network === network : true)
  );
  if (staticBundle) {
    // Map the static bundle back to a BundleDefinition for price/recommendedPrice lookups
    const matchedNetwork = network ?? staticBundle.network;
    const dmBundles = BUNDLES_BY_NETWORK[matchedNetwork];
    if (dmBundles) {
      // Try to find a matching bundle by size/price
      const match = dmBundles.find(
        (b) => b.size === staticBundle.size || b.costPrice === staticBundle.price
      );
      if (match) return match;
    }
  }

  return undefined;
}

/** Get bundles for a specific DataMart network code */
export function getBundlesByNetwork(network?: Network): BundleDefinition[] {
  if (!network) return ALL_BUNDLES;
  return BUNDLES_BY_NETWORK[network] ?? [];
}
