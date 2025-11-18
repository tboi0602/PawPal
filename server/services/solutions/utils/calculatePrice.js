import Resource from "../../solutions/models/Resource.js";

export const calculateTotalAmount = async (solution, data) => {
  const pets = data.pets || [];
  const userPets = data.userPets || [];
  const petsWithSubTotal = [];
  let totalAmount = 0;

  // Validate input
  if (!pets.length) {
    return { totalAmount: 0, petsWithSubTotal: [] };
  }

  for (const pet of pets) {
    // Validate required fields
    if (!pet.petId || !pet.resourceId) {
      console.error("❌ Missing required fields - petId or resourceId:", {
        petId: pet.petId,
        resourceId: pet.resourceId,
      });
      throw new Error("Each booking must have petId and resourceId");
    }

    // Lấy pet từ user.pets (passed in data)
    const petData = userPets.find((p) => p._id.toString() === pet.petId);

    if (!petData) {
      console.error("❌ Pet not found in user pets:", pet.petId);
      throw new Error(`Pet with ID ${pet.petId} not found`);
    }

    // Lấy resource từ database
    let resource;
    try {
      resource = await Resource.findById(pet.resourceId);

      if (!resource) {
        console.error("❌ Resource not found:", pet.resourceId);
        throw new Error(`Resource with ID ${pet.resourceId} not found`);
      }
    } catch (error) {
      console.error("❌ Error fetching resource:", error);
      throw error;
    }

    let subTotal = 0;
    const price = parseFloat(solution.price) || 0;

    // Tính thời lượng dựa trên dateStarts và dateEnd từ booking
    const startDate = new Date(data.dateStarts);
    const endDate = new Date(data.dateEnd);

    if (isNaN(startDate) || isNaN(endDate)) {
      console.error("❌ Invalid dates - dateStarts or dateEnd:", {
        dateStarts: data.dateStarts,
        dateEnd: data.dateEnd,
      });
      throw new Error("Invalid date format for dateStarts or dateEnd");
    }

    const durationMs = endDate - startDate;

    console.log("📊 Calculating price:", {
      pricingType: solution.pricingType,
      basePrice: price,
      durationMs,
      petWeight: petData.weight,
      petName: petData.name,
    });

    switch (solution.pricingType) {
      case "per_hour": {
        const hours = Math.max(durationMs / (1000 * 60 * 60), 1);
        subTotal = hours * price;
        console.log(`  per_hour: ${hours} hours × ${price} = ${subTotal}`);
        break;
      }
      case "per_day": {
        const days = Math.max(durationMs / (1000 * 60 * 60 * 24), 1);
        subTotal = days * price;
        console.log(`  per_day: ${days} days × ${price} = ${subTotal}`);
        break;
      }
      case "per_session":
        subTotal = price;
        console.log(`  per_session: ${price}`);
        break;
      case "per_kg": {
        const weight = parseFloat(petData.weight) || 0;
        subTotal = price + weight * 10000;
        console.log(`  per_kg: ${price} + ${weight} × 10000 = ${subTotal}`);
        break;
      }
      default:
        subTotal = price;
        console.log(`  default: ${price}`);
    }

    // Thêm upcharge từ resource nếu là Premium
    if (resource.type === "Premium" && resource.upcharge > 0) {
      if (solution.pricingType === "per_hour") {
        const hours = Math.max(durationMs / (1000 * 60 * 60), 1);
        subTotal += resource.upcharge * hours;
        console.log(
          `  + upcharge: ${resource.upcharge} × ${hours} = ${
            resource.upcharge * hours
          }`
        );
      } else {
        subTotal += resource.upcharge;
        console.log(`  + upcharge: ${resource.upcharge}`);
      }
    }

    console.log(`✅ Pet ${petData.name} subtotal: ${subTotal}`);

    petsWithSubTotal.push({
      petId: pet.petId,
      petName: petData.name,
      resourceId: pet.resourceId,
      resourceName: resource.name,
      subTotal,
    });
    totalAmount += subTotal;
  }

  console.log(`✅ Total amount: ${totalAmount}`);
  return { totalAmount, petsWithSubTotal };
};
