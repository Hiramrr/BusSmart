export async function searchPlaces(query, limit = 6) {
  if (!query || query.trim().length === 0) return []
  const q = encodeURIComponent(query.trim())
  // Use Nominatim OpenStreetMap public API (suitable for light use)
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${q}&addressdetails=1&limit=${limit}&countrycodes=mx`

  try {
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'es',
        // Nominatim requires a valid User-Agent; browsers set one, but add referer if needed
      },
    })

    if (!res.ok) return []
    const data = await res.json()
    // Map to useful shape
    return data.map((item) => ({
      display_name: item.display_name,
      lat: Number(item.lat),
      lon: Number(item.lon),
      type: item.type,
      class: item.class,
      boundingbox: item.boundingbox,
      address: item.address,
    }))
  } catch (err) {
    console.error('Geocode error', err)
    return []
  }
}
