import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(value: number, digits = 1): string {
  return value.toFixed(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}
