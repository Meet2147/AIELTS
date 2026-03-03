import { Suspense } from "react";
import CheckoutClient from "@/app/checkout/checkout-client";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<section className="card">Loading checkout...</section>}>
      <CheckoutClient />
    </Suspense>
  );
}
