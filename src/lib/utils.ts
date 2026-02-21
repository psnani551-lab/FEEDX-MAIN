import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // Ensure we don't double up on slashes if the url starts with one and BASE_URL ends with one
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const imagePath = url.startsWith('/') ? url : `/${url}`;
  return `${basePath}${imagePath}`;
}
