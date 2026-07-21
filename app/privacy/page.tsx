import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Vista",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14 text-ink">
      <h1 className="font-display text-[26px] font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-1 text-[13px] text-ink-soft">Last updated: July 21, 2026</p>

      <div className="mt-8 flex flex-col gap-6 text-[14px] leading-[1.7] text-ink-soft">
        <p>
          Vista (&quot;we&quot;, &quot;us&quot;) is a business dashboard and CRM application that
          connects to a merchant&apos;s Shopify store. This policy explains what data Vista
          accesses through the Shopify Admin API, how it is used, and how it can be deleted.
        </p>

        <section>
          <h2 className="mb-2 font-display text-[16px] font-semibold text-ink">What we collect</h2>
          <p>
            When a merchant connects their Shopify store to Vista, we access and store the
            following data via the Shopify Admin API, limited to customers who have placed an
            order:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Customer name, email, phone number, and shipping address</li>
            <li>Marketing consent status</li>
            <li>Order details: order number, total, currency, timestamp, sales channel</li>
            <li>Order line items: product title, quantity, price, and product image</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-[16px] font-semibold text-ink">How we use it</h2>
          <p>
            This data is used exclusively to power the merchant&apos;s own Vista dashboard: a
            customer relationship pipeline, order history, and revenue analytics. Data is never
            sold, shared with third parties, or used for advertising.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-[16px] font-semibold text-ink">Storage</h2>
          <p>
            Data is stored in a private Postgres database (Neon) accessible only to the
            merchant&apos;s own Vista account, and transmitted over encrypted connections (HTTPS).
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-[16px] font-semibold text-ink">
            Data deletion and GDPR requests
          </h2>
          <p>
            Vista implements Shopify&apos;s mandatory compliance webhooks. When a customer requests
            their data or asks for it to be deleted, or when a merchant uninstalls the app, the
            corresponding records are deleted from our database automatically or upon request.
            To make a data request directly, contact us at the email below.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-[16px] font-semibold text-ink">Contact</h2>
          <p>
            Questions about this policy or data requests: <span className="text-ink">info@netz-digi.com</span>
          </p>
        </section>
      </div>
    </div>
  );
}
