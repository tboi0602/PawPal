export async function getDistance(from, to) {
  const apiKey = "1cc59b8cb1224400b8626733046040ec"; // Thay bằng key của bạn

  try {
    // Hàm geocoding tên địa chỉ -> tọa độ
    const geocode = async (address) => {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          address
        )}&apiKey=${apiKey}&limit=1`
      );
      const data = await res.json();
      if (!data.features || data.features.length === 0) {
        throw new Error(`Không tìm thấy địa chỉ: ${address}`);
      }
      const { lat, lon } = data.features[0].properties;
      return { lat, lon };
    };

    const fromCoords = await geocode(from);
    const toCoords = await geocode(to);

    // Lấy route (đường đi) từ Geoapify Routing API
    const resRoute = await fetch(
      `https://api.geoapify.com/v1/routing?waypoints=${fromCoords.lat},${fromCoords.lon}|${toCoords.lat},${toCoords.lon}&mode=drive&apiKey=${apiKey}`
    );
    const dataRoute = await resRoute.json();
    if (!dataRoute.features || dataRoute.features.length === 0) {
      throw new Error("Không lấy được tuyến đường");
    }

    const route = dataRoute.features[0].properties;

    return {
      from,
      to,
      distance_km: (route.distance / 1000).toFixed(2),
      duration_hr: (route.time / 3600).toFixed(1),
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}
