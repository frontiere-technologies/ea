import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getIconsForApplication(app: any): string[] {
  const icons: string[] = [];

  if (!app || !app.properties) return icons;

  const p = app.properties;

  // ACCESS TYPE → Web  
  if (p.access_type === "Web") {
    icons.push("/svg/image_1_.svg");
  }

  // HOSTING → Cloud  
  if (p.hosting === "Cloud") {
    icons.push("/svg/image_2_.svg");
  }

  // SUPPLIER → Frontiere  
  if (p.sw_supplier === "Frontiere") {
    icons.push("/svg/frontiere.svg");
  }

  return icons;
}