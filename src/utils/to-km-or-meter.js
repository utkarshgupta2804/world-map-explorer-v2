export function toKMorMeter(num) {
  return num < 1000 ? parseInt(num) + " meters" : parseInt(num / 1000) + " Kilo meters";
}

export const geocodingAPI = "https://nominatim.openstreetmap.com";
