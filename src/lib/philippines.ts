// src/lib/philippines.ts

const BASE_URL = 'https://psgc.gitlab.io/api';

export interface LocationNode {
  code: string;
  name: string;
}

/**
 * Fetches all provinces. Injects Metro Manila (NCR) to bypass the Region level.
 */
export async function getAllProvinces(): Promise<LocationNode[]> {
  const res = await fetch(`${BASE_URL}/provinces`);
  if (!res.ok) throw new Error('Failed to fetch provinces');
  const provinces = await res.json();
  
  // Inject NCR as a "Province" so users in Manila can select it
  provinces.push({ code: '130000000', name: 'Metro Manila' });
  
  // Sort alphabetically
  return provinces.sort((a: LocationNode, b: LocationNode) => a.name.localeCompare(b.name));
}

/**
 * Fetches Cities/Municipalities based on Province Code.
 * Handles the special case if the user selects Metro Manila.
 */
export async function getCities(provinceCode: string): Promise<LocationNode[]> {
  const endpoint = provinceCode === '130000000' 
    ? `${BASE_URL}/regions/130000000/cities-municipalities` 
    : `${BASE_URL}/provinces/${provinceCode}/cities-municipalities`;

  const res = await fetch(endpoint);
  if (!res.ok) throw new Error('Failed to fetch cities');
  const cities = await res.json();
  return cities.sort((a: LocationNode, b: LocationNode) => a.name.localeCompare(b.name));
}

/**
 * Fetches Barangays based on City Code.
 */
export async function getBarangays(cityCode: string): Promise<LocationNode[]> {
  const res = await fetch(`${BASE_URL}/cities-municipalities/${cityCode}/barangays`);
  if (!res.ok) throw new Error('Failed to fetch barangays');
  const barangays = await res.json();
  return barangays.sort((a: LocationNode, b: LocationNode) => a.name.localeCompare(b.name));
}