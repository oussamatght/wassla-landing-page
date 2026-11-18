/**
 * next/image loader.
 *
 * Backend media are Cloudinary `secure_url`s
 * (https://res.cloudinary.com/<cloud>/image/upload/[transforms/]v<ver>/<id>.<ext>).
 * We insert delivery transformations
 * right after `/upload/` so the CDN serves a correctly sized AVIF/WebP.
 * Local files (e.g. /brand/...) are returned unchanged with a width hint.
 */
interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/)(.*)$/;

export default function cloudinaryLoader({ src, width, quality }: LoaderArgs): string {
  const match = CLOUDINARY_UPLOAD.exec(src);
  if (match) {
    const [, prefix, rest] = match;
    const q = quality ? `q_${quality}` : "q_auto";
    return `${prefix}f_auto,${q},c_limit,w_${width}/${rest}`;
  }
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}w=${width}`;
}
