import Booking from "../models/Booking.js";
import Resource from "../models/Resource.js";

export const validatePetBooking = async (pet, solution, dateStartVN, dateEndVN) => {
    const resource = await Resource.findById(pet.resourceId);
    if (!resource) throw new Error(`Resource ${pet.resourceId} not found`);

    // ⚙️ Kiểm tra giờ làm việc (chỉ áp dụng cho cleaning, beauty, training)
    if (["cleaning", "beauty", "training"].includes(solution.type)) {
        const [resStartHour, resStartMinute] = resource.startTime.split(":").map(Number);
        const [resEndHour, resEndMinute] = resource.endTime.split(":").map(Number);

        const bookingStartHour = dateStartVN.getUTCHours(); // giờ VN
        const bookingStartMinute = dateStartVN.getUTCMinutes();

        const bookingEndHour = dateEndVN.getUTCHours();
        const bookingEndMinute = dateEndVN.getUTCMinutes();

        console.log("Resource working hours:", resource.startTime, "-", resource.endTime);
        console.log(
            `Booking time: ${bookingStartHour}:${bookingStartMinute} - ${bookingEndHour}:${bookingEndMinute}`
        );

        const startValid =
            bookingStartHour > resStartHour ||
            (bookingStartHour === resStartHour && bookingStartMinute >= resStartMinute);
        const endValid =
            bookingEndHour < resEndHour ||
            (bookingEndHour === resEndHour && bookingEndMinute <= resEndMinute);

        const withinWorkingHours = startValid && endValid;

        if (!withinWorkingHours) {
            throw new Error(
                `Booking for resource ${resource.name} must be within working hours (${resource.startTime} - ${resource.endTime})`
            );
        }

        // ⚙️ Kiểm tra trùng lịch
        const overlap = await Booking.findOne({
            "pets.petId": pet.petId,
            solutionId: solution._id,
            status: { $in: ["pending", "confirmed"] },
            dateStarts: { $lt: dateEndVN },
            dateEnd: { $gt: dateStartVN },
        });

        if (overlap) {
            throw new Error(`Pet already has a booking for this service during the selected period.`);
        }
    }

    return resource;
};
