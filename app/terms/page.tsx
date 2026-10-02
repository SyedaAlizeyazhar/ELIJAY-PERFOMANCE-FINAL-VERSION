import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage } from "@/components/site/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that apply when you use the ${SITE.name} website and network.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Terms of"
      accent="Service."
      intro={
        <p>
          These Terms apply to your use of the {SITE.name} website, forms and
          publisher portal, operated by {SITE.legalName} (&ldquo;ELIJAY&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the site or submitting a
          form you agree to them. Specific campaigns are governed by the
          insertion order or agreement signed for that campaign, which takes
          priority over these Terms where they differ.
        </p>
      }
      sections={[
        {
          heading: "Who may use the site",
          body: (
            <p>
              The site is for businesses buying or selling calls, live
              transfers and leads. You must be at least 18 and authorized to act
              for the company you represent, and the information you submit must
              be accurate.
            </p>
          ),
        },
        {
          heading: "Applications and offers",
          body: (
            <p>
              Submitting a buyer offer or publisher application does not create
              a contract or guarantee approval. We review every submission and
              may accept or decline at our discretion. Offers, payouts, caps and
              payment terms shown on the site are representative and can change
              with buyer demand, geo, hours and call quality.
            </p>
          ),
        },
        {
          heading: "Compliance",
          body: (
            <>
              <p>
                Publishers and buyers are each responsible for following every
                law that applies to their traffic and campaigns, including the
                Telephone Consumer Protection Act (TCPA), the Telemarketing Sales
                Rule, CAN-SPAM, state telemarketing and mini-TCPA laws, Do-Not-Call
                rules and any licensing rules for their vertical.
              </p>
              <p>
                Publishers must hold valid, documented consent for every call or
                lead they send and provide consent records on request. We may
                pause, reject or refuse payment for traffic that is
                non-compliant, fraudulent, duplicated or outside the agreed
                targeting.
              </p>
            </>
          ),
        },
        {
          heading: "Publisher accounts",
          body: (
            <p>
              Approved publishers receive login details for the offer portal.
              Keep them confidential; you are responsible for activity under
              your account. Offer details in the portal are confidential and may
              not be shared outside your company. We may suspend access at any
              time.
            </p>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <p>
              Don&rsquo;t misuse the site: no scraping, attempts to access
              accounts or admin areas that aren&rsquo;t yours, interfering with
              the site&rsquo;s operation, or submitting false, misleading or
              unlawful information.
            </p>
          ),
        },
        {
          heading: "Intellectual property",
          body: (
            <p>
              The site, the ELIJAY name and logo, and its content belong to us
              or our licensors. You may not copy or reuse them without written
              permission.
            </p>
          ),
        },
        {
          heading: "Disclaimers",
          body: (
            <p>
              The site is provided &ldquo;as is&rdquo;. We do not guarantee call
              volume, payout, conversion or campaign availability, or that the
              site will be uninterrupted or error-free.
            </p>
          ),
        },
        {
          heading: "Limitation of liability",
          body: (
            <p>
              To the fullest extent the law allows, ELIJAY is not liable for
              indirect, incidental, special or consequential damages, or lost
              profits, arising from your use of the site. Nothing here limits
              liability that cannot be limited by law.
            </p>
          ),
        },
        {
          heading: "Governing law",
          body: (
            <p>
              {SITE.governingState
                ? `These Terms are governed by the laws of the State of ${SITE.governingState} and applicable U.S. federal law.`
                : "These Terms are governed by applicable U.S. federal and state law."}
            </p>
          ),
        },
        {
          heading: "Changes and contact",
          body: (
            <p>
              We may update these Terms; the date at the top shows the latest
              version. Also see our{" "}
              <Link href="/privacy" className="text-gold hover:underline">
                Privacy Policy
              </Link>
              . Questions? <ContactLine />.
            </p>
          ),
        },
      ]}
    />
  );
}
