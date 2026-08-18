const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

/** Prefix root-relative public assets and plain anchor URLs for GitHub Pages. */
export function withBasePath(path: string) {
  if (!basePath || !path.startsWith("/") || path.startsWith("//")) return path;
  return `${basePath}${path}`;
}
