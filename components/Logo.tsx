import Image from "next/image";

// logo-full-transparent.webp is 1536x1024; className controls the rendered height.
export default function Logo({
  className,
  style,
  eager,
}: {
  className?: string;
  style?: React.CSSProperties;
  /** Above-the-fold logo: load immediately instead of lazily. */
  eager?: boolean;
}) {
  return (
    <Image
      src="/images/logo-full-transparent.webp"
      alt="Fitwinz"
      width={1536}
      height={1024}
      sizes="240px"
      loading={eager ? "eager" : undefined}
      className={className}
      style={style}
    />
  );
}
