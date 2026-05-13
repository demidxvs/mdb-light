import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

function toRemotePattern(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);

    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port || undefined,
    };
  } catch {
    return null;
  }
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      toRemotePattern(process.env.NEXT_PUBLIC_SUPABASE_URL),
      toRemotePattern(process.env.NEXT_PUBLIC_ADMIN_SUPABASE_URL),
    ].filter(
      (pattern): pattern is NonNullable<ReturnType<typeof toRemotePattern>> => Boolean(pattern),
    ),
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
