// src/lib/philippines.ts

export const PHILIPPINE_LOCATIONS: Record<string, string[]> = {
  "Metro Manila": ["Manila", "Quezon City", "Makati", "Taguig", "Pasig", "Mandaluyong", "Pasay", "Caloocan", "Las Piñas", "Marikina", "Muntinlupa", "Navotas", "Parañaque", "Pateros", "San Juan", "Valenzuela"],
  "Cebu": ["Cebu City", "Lapu-Lapu City", "Mandaue City", "Talisay", "Danao", "Toledo", "Bogo", "Carcar", "Naga"],
  "Davao del Sur": ["Davao City", "Digos", "Santa Cruz", "Bansalan", "Matanao"],
  "Cavite": ["Bacoor", "Dasmariñas", "Imus", "Tagaytay", "Cavite City", "General Trias", "Trece Martires"],
  "Laguna": ["Santa Rosa", "Calamba", "San Pedro", "Biñan", "Cabuyao", "San Pablo"],
  "Pampanga": ["Angeles City", "San Fernando", "Mabalacat"],
  "Rizal": ["Antipolo", "Cainta", "Taytay", "Binangonan"],
  "Batangas": ["Batangas City", "Lipa", "Tanauan", "Santo Tomas"],
  // Add more as needed for the project scope
};

export const PROVINCES = Object.keys(PHILIPPINE_LOCATIONS).sort();