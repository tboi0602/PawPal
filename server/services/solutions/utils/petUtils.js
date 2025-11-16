import { USER_TARGET } from "../../../configs/config.js";

export const enrichPetData = async (userId, pet, resource) => {
  const url = `${USER_TARGET}/users/${userId}/pets/${pet.petId}`;
  console.log("🔍 Fetching pet data:", url);

  const res = await fetch(url);
  console.log("🔍 Response status:", res.status);

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status} when fetching pet ${pet.petId}`);
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("❌ JSON parse error:", err, "Raw response:", text);
    throw new Error(`Invalid JSON when fetching pet ${pet.petId}`);
  }

  console.log("✅ Parsed pet data:", data);

  if (!data || typeof data !== "object") {
    throw new Error(`No data returned for pet ${pet.petId}`);
  }

  if (!data.pet) {
    console.error("❌ No 'pet' field found in data:", data);
    throw new Error(`Pet ${pet.petId} not found in response`);
  }

  return {
    ...pet,
    petName: data.pet.name || "Unknown",
    resourceName: resource.name || "Unknown resource",
  };
};
