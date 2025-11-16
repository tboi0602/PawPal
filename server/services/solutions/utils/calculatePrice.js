import Resource from "../models/Resource.js";
import { USER_TARGET } from "../../../configs/config.js";

export const calculateTotalAmount = async (solution, data) => {
  const pets = data.pets || [];
  const petsWithSubTotal = [];
  let totalAmount = 0;

  for (const pet of pets) {
    // Lấy pet từ API
    const responsePet = await fetch(
      `${USER_TARGET}/users/${data.userId}/pets/${pet.petId}`
    );
    const dataPet = await responsePet.json();
    const Pet = dataPet.pet;

    if (!Pet) {
      console.log("Pet not found:", pet.petId);
      continue;
    }

    const resource = await Resource.findById(pet.resourceId);
    if (!resource) {
      console.log("Resource not found:", pet.resourceId);
      continue;
    }

    let subTotal = 0;
    const price = parseFloat(solution.price) || 0;

    switch (solution.pricingType) {
      case "per_hour": {
        const hours = Math.max(
          (new Date(data.dateEnd) - new Date(data.dateStarts)) /
            (1000 * 60 * 60),
          1
        );
        subTotal = hours * price;
        break;
      }
      case "per_day": {
        const days = Math.max(
          (new Date(data.dateEnd) - new Date(data.dateStarts)) /
            (1000 * 60 * 60 * 24),
          1
        );
        subTotal = days * price;
        break;
      }
      case "per_session":
        subTotal = price;
        break;
      case "per_kg": {
        const weight = parseFloat(Pet.weight) || 0;
        subTotal = price + weight * 10000;
        break;
      }
      default:
        subTotal = price;
    }

    if (resource.type === "Premium" && resource.upcharge > 0) {
      if (solution.pricingType !== "per_hour") {
        subTotal += resource.upcharge;
      } else {
        const hours = Math.max(
          (new Date(data.dateEnd) - new Date(data.dateStarts)) /
            (1000 * 60 * 60),
          1
        );
        subTotal += resource.upcharge * hours;
      }
    }

    petsWithSubTotal.push({ ...pet, subTotal });
    totalAmount += subTotal;
  }

  return { totalAmount, petsWithSubTotal };
};
