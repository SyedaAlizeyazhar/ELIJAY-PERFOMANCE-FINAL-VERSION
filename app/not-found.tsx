import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowOrb } from "@/components/ui/arrow-orb";

export default function NotFound() {
  return (
    <div className="bg-hero-gradient">
      <div className="container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-[7rem] font-medium italic leading-none text-gold-gradient md:text-[9rem]">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-foreground md:text-3xl">
          This line went dead.
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          The page you&rsquo;re looking for has moved or never existed. Let&rsquo;s
          route you somewhere useful.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button asChild size="lg" shimmer className="pr-5">
            <Link href="/">
              Back to home <ArrowOrb />
            </Link>
          </Button>
          <Link href="/contact" className="text-sm text-gold hover:underline">
            Contact our team →
          </Link>
        </div>
      </div>
    </div>
  );
}
