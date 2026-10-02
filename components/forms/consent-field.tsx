import Link from "next/link";

// Required agreement to the Privacy Policy and Terms on every lead form. A
// native checkbox so the browser's own `required` validation blocks submit.
export function ConsentField({ id = "consent" }: { id?: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-muted">
      <input
        id={id}
        name={id}
        type="checkbox"
        required
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-muted accent-[#D6A343]"
      />
      <span>
        I agree to the{" "}
        <Link href="/privacy" target="_blank" className="text-gold underline-offset-2 hover:underline">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" target="_blank" className="text-gold underline-offset-2 hover:underline">
          Terms of Service
        </Link>
        , and consent to ELIJAY Performance Partners contacting me by email,
        phone or messaging app about this submission.
      </span>
    </label>
  );
}
