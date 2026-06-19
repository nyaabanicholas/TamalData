import { BulkBuyUI } from "@/components/buy/BulkBuyUI";

export const metadata = {
  title: "Bulk Data Purchase",
  description: "Send data to multiple numbers in one batch — MTN, Telecel, AirtelTigo.",
};

export default function BulkBuyPage() {
  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="container-content">
        <div className="text-center pt-12 mb-10">
          <h1 className="font-heading text-4xl md:text-5xl text-text-primary mb-2">
            Bulk Data Purchase
          </h1>
          <p className="text-text-secondary font-barlow text-lg max-w-2xl mx-auto">
            Send data bundles to multiple numbers at once. All deducted from your DataMart wallet.
          </p>
        </div>
        <BulkBuyUI />
      </div>
    </main>
  );
}
