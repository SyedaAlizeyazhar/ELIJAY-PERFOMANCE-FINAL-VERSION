import type { Metadata } from "next";
import { ContactLine, LegalPage } from "@/components/site/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} collects, uses and protects the information you share with us.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Privacy"
      accent="Policy."
      intro={
        <p>
          This Privacy Policy explains how {SITE.legalName} (&ldquo;ELIJAY&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses and shares
          information when you visit {SITE.url.replace("https://", "")} or
          submit a form to buy calls, sell calls, apply for an offer or contact
          us. Our services are offered to businesses, not to consumers.
        </p>
      }
      sections={[
        {
          heading: "Information we collect",
          body: (
            <>
              <p>
                <strong className="text-foreground">Information you give us:</strong> name, company
                name, business email, phone number, messaging IDs (such as
                Telegram, WhatsApp or Teams), LinkedIn or website URL, the
                verticals, traffic sources, payouts and targeting you describe,
                and anything else you write in a form or message.
              </p>
              <p>
                <strong className="text-foreground">Publisher accounts:</strong> if your application is
                approved we create a username and a password, which is stored
                only in hashed form.
              </p>
              <p>
                <strong className="text-foreground">Technical data:</strong> standard server logs such
                as IP address, browser type, pages visited and timestamps, and a
                small number of cookies needed to keep you signed in.
              </p>
            </>
          ),
        },
        {
          heading: "How we use it",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>To review your application or offer and decide whether to work with you.</li>
              <li>To contact you about your submission, campaigns, payouts and account.</li>
              <li>To run the publisher portal and keep accounts secure.</li>
              <li>To prevent fraud, enforce our Terms and meet legal obligations.</li>
              <li>To understand and improve how the site is used.</li>
            </ul>
          ),
        },
        {
          heading: "How we share it",
          body: (
            <>
              <p>We do not sell your personal information. We share it only:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  With service providers that host the site and store form
                  submissions for us (for example our hosting, database and
                  spreadsheet providers), under their own security terms.
                </li>
                <li>
                  Where needed to set up a campaign between a publisher and a
                  buyer, limited to the business details that campaign requires.
                </li>
                <li>When required by law, or to protect our rights, users or the public.</li>
                <li>As part of a merger, acquisition or sale of business assets.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "Cookies",
          body: (
            <p>
              We use essential cookies only, to keep admin and publisher
              sessions signed in. We do not use advertising cookies. You can
              block cookies in your browser, but the publisher portal will not
              work without them.
            </p>
          ),
        },
        {
          heading: "How long we keep it",
          body: (
            <p>
              We keep submissions and account details for as long as we have a
              business relationship with you, and afterwards only as long as
              needed for legal, accounting or dispute purposes.
            </p>
          ),
        },
        {
          heading: "Security",
          body: (
            <p>
              Data is sent over encrypted connections (HTTPS), passwords are
              hashed, and access to submissions is limited to our team. No
              system is perfectly secure, so please don&rsquo;t send sensitive
              consumer data through our forms.
            </p>
          ),
        },
        {
          heading: "Your choices and rights",
          body: (
            <p>
              You can ask us to access, correct or delete your information, or
              to stop contacting you, at any time — <ContactLine />. Depending on
              where you live (for example California, or the EU/UK), you may
              have additional rights under local law, and we will honor them as
              required.
            </p>
          ),
        },
        {
          heading: "Children",
          body: (
            <p>
              This site is for businesses and is not directed to anyone under
              18. We do not knowingly collect information from children.
            </p>
          ),
        },
        {
          heading: "Changes and contact",
          body: (
            <p>
              We may update this policy; the date at the top shows the latest
              version. Questions about privacy? <ContactLine />
              {SITE.address ? <> or write to {SITE.legalName}, {SITE.address}</> : null}.
            </p>
          ),
        },
      ]}
    />
  );
}
