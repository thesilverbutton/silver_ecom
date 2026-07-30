import Link from "next/link";
import { PackageOpen, ArrowRight } from "lucide-react";

interface CategoryEmptyProps {
  categoryName: string;
  gender: "men" | "women";
}

export function CategoryEmpty({ categoryName, gender }: CategoryEmptyProps) {
  const genderLabel = gender === "men" ? "Men" : "Women";
  const otherGender = gender === "men" ? "women" : "men";
  const otherLabel = gender === "men" ? "Women" : "Men";

  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <PackageOpen className="h-7 w-7 text-muted-foreground" />
      </div>

      <h2 className="mt-6 font-[family-name:var(--font-serif)] text-2xl font-semibold">
        Nothing here just yet
      </h2>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        We don&apos;t have any {categoryName.toLowerCase()} in our {genderLabel.toLowerCase()}&apos;s
        collection right now. Our artisans are always weaving something new — check back soon.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/${gender}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse all {genderLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={`/${otherGender}`}
          className="inline-flex items-center justify-center rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
        >
          Shop {otherLabel}
        </Link>
      </div>

      <Link
        href="/shop"
        className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        View the full collection
      </Link>
    </div>
  );
}
