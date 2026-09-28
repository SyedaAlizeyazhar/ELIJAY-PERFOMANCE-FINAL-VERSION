import { Card, CardContent } from "@/components/ui/card";
import { FadeUp } from "@/components/site/motion-wrap";
import { PageIntro } from "@/components/site/page-intro";
import { BuyerForm } from "@/components/forms/buyer-form";

export default function ForBuyersPage() {
  return (
    <div className="bg-hero-gradient">
      <div className="container grid gap-14 py-16 md:py-24 lg:grid-cols-[1fr_1.25fr]">
        <FadeUp>
          <PageIntro
            kicker="Buy Calls"
            title="Have a payout"
            accent="to offer?"
            body="Buying inbound calls, live transfers or leads in Medicare, Final Expense, Auto, Home Services or another vertical? Tell us your payout and targeting — our team reviews every submission and publishes approved campaigns to vetted publishers."
            points={[
              "Real-time routing from vetted, compliant publishers",
              "Full control over geo, buffer, caps and hours",
              "Delivery by DID, RTB, ping-post or IVR",
              "Every call recorded and quality-scored",
              "A direct line to our team, not a support queue",
            ]}
          />
        </FadeUp>

        <FadeUp>
          <Card>
            <CardContent className="p-6 md:p-10">
              <BuyerForm />
            </CardContent>
          </Card>
        </FadeUp>
      </div>
    </div>
  );
}
