import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The only allowed quality, so every <Image> resolves to it without a prop.
    // The default 75 bands the dark falloff in the renders; see QUALITY in
    // scripts/prepare-media.mjs, which this is the second encode after.
    qualities: [95],
  },
};

export default nextConfig;
