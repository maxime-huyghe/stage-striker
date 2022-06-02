import { base } from "$app/paths";

/**
 * Adds the base path to the given URL.
 * @param url a valid URL, without the base path
 * @returns the same URL with the base path added
 */
export function appUrl(url: string): string {
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}
