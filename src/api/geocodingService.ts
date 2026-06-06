export async function getLocationName(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        method: "GET",
        headers: {
          "User-Agent": "kishanchudasama9998@gmail.com", // REQUIRED by Nominatim
          "Accept": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch location:", res.status);
      return null;
    }

    const data = await res.json();
    console.log("data..........." + data)
    return data.display_name || null;
  } catch (error) {
    console.error("Error fetching location name:", error);
    return null;
  }
}
