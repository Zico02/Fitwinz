import Link from "next/link";
import SimplePageHeader from "@/components/SimplePageHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SimplePageHeader />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-gray-600 mb-6">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
          <Link href="/" className="bg-black text-white px-8 py-3 rounded-full font-semibold">
            BACK TO SHOP
          </Link>
        </div>
      </div>
    </div>
  );
}
