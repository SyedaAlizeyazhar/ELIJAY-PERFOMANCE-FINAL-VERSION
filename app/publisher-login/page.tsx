import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/site/logo";
import { Card, CardContent } from "@/components/ui/card";
import { PublisherLoginForm } from "@/components/forms/publisher-login-form";
import { getPublisherSession } from "@/lib/publisher-auth";

export const metadata: Metadata = { title: "Publisher Login", robots: { index: false } };

export const dynamic = "force-dynamic";

/** Only same-site paths are allowed as a post-login destination. */
function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/publisher";
}

export default async function PublisherLoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = safeNext(searchParams.next);
  if (await getPublisherSession()) redirect(next);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-hero-gradient px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <LogoMark className="mb-4 h-16 w-16" />
            <h1 className="font-display text-xl font-semibold text-foreground">
              Publisher Login
            </h1>
            <p className="mt-1 text-sm text-muted">
              Log in with the username and password our team sent you to view
              live offers.
            </p>
          </div>

          <PublisherLoginForm next={next} />

          <p className="mt-6 text-center text-sm text-muted">
            Not a publisher yet?{" "}
            <Link href="/apply-as-publisher" className="text-gold underline">
              Apply here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
