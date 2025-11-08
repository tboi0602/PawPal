import Pet from "../models/Pet.js";
import User from "../models/User.js";
import { put, del } from "@vercel/blob";

export const getPet = async (req, res) => {
  const { userId, id } = req.params;
  try {
    if (!id) {
      const pets = await Pet.find({ userId }).lean();
      if (!pets || pets.length == 0)
        return res
          .status(404)
          .json({ success: false, message: "Pet not found" });
      return res.status(200).json({ success: true, pets: pets });
    }
    const pet = await Pet.findOne({ _id: id, userId: userId });
    if (!pet)
      return res.status(404).json({ success: false, message: "Pet not found" });
    return res.status(200).json({ success: true, pet: pet });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server Pet error: ${error.message}` });
  }
};

//*  ADD PET
export const addPet = async (req, res) => {
  const { userId } = req.params;
  let petData = req.body;
  const file = req.file;

  try {
    const user = await User.findById(userId).lean();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (file) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({
          message: "Server configuration error: Missing Vercel Blob Token.",
        });
      }
      const uploadPromises = await put(
        `users/pets/${Date.now()}-${file.originalname}`,
        file.buffer,
        {
          access: "public",
        }
      );
      petData.image = uploadPromises.url;
    }

    const newPet = new Pet({ userId: userId, ...petData });
    const savePet = await newPet.save();
    return res.status(201).json({
      success: true,
      message: `Pet created successfully`,
      Pet: savePet,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server User error: ${error.message}` });
  }
};

//* UPDATE INFORMATION PET
export const updatePet = async (req, res) => {
  const { userId, id } = req.params;
  let updateData = req.body;
  const file = req.file;

  try {
    if (file) {
      let existingPet = await Pet.findById(id);
      if (!existingPet) {
        return res
          .status(404)
          .json({ success: false, message: "Pet not found" });
      }
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({
          success: false,
          message: "Server configuration error: Missing Vercel Blob Token.",
        });
      }
      const oldImageUrl = existingPet?.image;
      const uploadedBlob = await put(
        `users/pets/${Date.now()}-${file.originalname}`,
        file.buffer,
        {
          access: "public",
        }
      );

      const newImageUrl = uploadedBlob.url;
      if (oldImageUrl) {
        await del(oldImageUrl);
      }
      updateData.image = newImageUrl;
    }

    const PetUpdated = await Pet.findOneAndUpdate(
      { _id: id, userId: userId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!PetUpdated)
      return res.status(404).json({ success: false, message: "Pet not found" });

    res.status(200).json({
      success: true,
      message: "Pet update successful.",
      pet: PetUpdated,
    });
  } catch (error) {
    res.status(500).json({ message: `Server Pet error: ${error}` });
  }
};

//* DELETE PET
export const deletePet = async (req, res) => {
  const { userId, id } = req.params;
  try {
    const PetDeleted = await Pet.findOneAndDelete({ _id: id, userId: userId });
    if (!PetDeleted)
      return res.status(404).json({ success: false, message: "Pet not found" });

    await del(PetDeleted.image);
    res.status(200).json({
      success: true,
      message: "Pet deleted successfully.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Server Pet error: ${error}` });
  }
};
