import Image from "next/image";

// logo-full-transparent.webp is 1536x1024; className controls the rendered height.
export default function Logo({
  className,
  style,
  priority,
}: {
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}) {
  return (
    <Image
      src="/images/logo-full-transparent.webp"
      alt="Fitwinz"
      width={1536}
      height={1024}
      sizes="240px"
      priority={priority}
      className={className}
      style={style}
    />
  );
}
