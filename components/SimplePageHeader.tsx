import Link from "next/link";
import Logo from "@/components/Logo";

/** Centered logo bar used by checkout and other standalone pages. */
export default function SimplePageHeader({ className = "bg-white border-gray-100" }: { className?: string }) {
  return (
    <header className={`h-16 flex items-center justify-center border-b ${className}`}>
      <Link href="/">
        <Logo priority className="h-16 w-auto object-contain bg-transparent" />
      </Link>
    </header>
  );
}
