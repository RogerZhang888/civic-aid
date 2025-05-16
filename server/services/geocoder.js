//THIS IS TEMPORARY LOCAL IMPLEMENTATION

const NodeGeocoder = require('node-geocoder');

// Temporary using OpenStreetMap (free)
const geocoder = NodeGeocoder({
  provider: 'openstreetmap'
});

export const geocodeAddress = async (address) => {
  try {
    const res = await geocoder.geocode(address);
    return {
      lat: res[0].latitude,
      lon: res[0].longitude,
      formatted: res[0].formattedAddress
    };
  } catch (error) {
    return { error: "Geocoding failed" };
  }
};