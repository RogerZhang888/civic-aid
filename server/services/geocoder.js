import NodeGeocoder from "node-geocoder";

const geocoder = NodeGeocoder({ provider: "openstreetmap" });

export async function geocodeAddress(address) {
   try {
      const res = await geocoder.geocode(address);
      return {
         lat: res[0].latitude,
         lon: res[0].longitude,
         formatted: res[0].formattedAddress,
      };
   } catch (error) {
      return { error: "Geocoding failed" };
   }
}

export async function reverseGeocode(lat, lon) {
   try {
      const res = await geocoder.reverse({ lat, lon });
      return res[0].formattedAddress;
   } catch (error) {
      return { error: "Reverse geocoding failed" };
   }
}