import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
};
