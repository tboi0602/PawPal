import { useState, useRef } from "react";
import {
  X,
  Save,
  PawPrint,
  Info,
  Image as ImageIcon,
  Heart,
  Tag,
  Calendar,
  UserPlus,
  Scale,
  FileText,
  ImagePlus,
} from "lucide-react";
import InputForm from "../../../inputs/InputForm";
import Swal from "sweetalert2";
import { editPet } from "../../../../services/users/petAPI";
import { Loader2 } from "../../Loaders/Loader2";

const PET_TYPES = ["Dog", "Cat"];
const PET_GENDER = [
  { value: true, label: "Male" },
  { value: false, label: "Female" },
];

export const EditPetModel = ({ userId, pet, setOpenEdit, reloadPets }) => {
  const [imagePreview, setImagePreview] = useState(pet.image);
  const fileInputRef = useRef(null);
  const [isloading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: pet.name,
    type: pet.type,
    breed: pet.breed,
    age: pet.age,
    gender: pet.gender,
    weight: pet.weight,
    specialNotes: pet.specialNotes,
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" || name === "weight" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setImagePreview(fileUrl);
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleCancel = () => setOpenEdit(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const requiredFields = [
      { key: "name", label: "Pet's Name" },
      { key: "type", label: "Pet Type" },
      { key: "age", label: "Age" },
      { key: "gender", label: "Gender" },
      { key: "weight", label: "Weight" },
    ];

    for (const field of requiredFields) {
      if (!formData[field.key] && formData[field.key] !== 0) {
        Swal.fire("Warning", `Please enter the ${field.label}.`, "warning");
        setIsLoading(false);
        return;
      }
    }

    const submitFormData = new FormData();
    submitFormData.append("name", formData.name);
    submitFormData.append("type", formData.type);
    submitFormData.append("breed", formData.breed);
    submitFormData.append("age", formData.age);
    submitFormData.append("gender", formData.gender);
    submitFormData.append("weight", formData.weight);
    submitFormData.append("specialNotes", formData.specialNotes);
    if (formData.image instanceof File) {
      submitFormData.append("image", formData.image);
    }

    try {
      const dataRes = await editPet(userId, pet._id, submitFormData);

      if (!dataRes.success) {
        Swal.fire("Error!", dataRes.message || "Add pet failed.", "error");
      } else {
        Swal.fire("Success!", "Pet added successfully.", "success");
        setOpenEdit(false);
        reloadPets();
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        error.message || "An unexpected error occurred.",
        "error"
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed z-99 inset-0 flex justify-center items-center max-h-screen bg-black/30">
      <div className="relative z-50 w-full max-w-4xl bg-white text-black shadow-2xl rounded-xl overflow-y-auto max-h-[90vh] transition-all duration-300">
        {/* Header */}
        <h1 className="w-full text-3xl font-bold bg-black text-white p-4 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PawPrint size={28} /> Edit Pet
          </div>
          <X
            className="cursor-pointer text-gray-300 hover:text-red-400 transition"
            size={24}
            onClick={handleCancel}
          />
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="bg-gray-50 w-full p-6 grid grid-cols-2 gap-6">
            {/*  Pet Photo  */}
            <div className="flex flex-col items-center justify-start gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                <ImageIcon className="text-orange-500" size={24} /> Pet Photo
              </h3>
              {/* Avatar Area */}
              <div
                className="relative flex justify-center items-center w-44 h-44 bg-gray-100 border-4 rounded-full overflow-hidden cursor-pointer hover:border-gray-500"
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  disabled={isloading}
                />

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="pet-avatar"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <ImagePlus className="w-1/3 h-1/3 text-gray-400" />
                    <span className="text-sm text-gray-500 mt-2">
                      Upload Photo
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 bg-opacity-30 flex flex-col items-center justify-center text-white text-lg font-bold opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-sm">Choose Photo</span>
                </div>
              </div>

              <div className="font-bold px-2 py-1 rounded-lg flex gap-2 text-gray-600">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-sm">Ready for a new friend!</span>
              </div>
            </div>

            {/* Cột 2: Form Inputs */}
            <div className="space-y-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2 mb-3">
                <Info className="text-blue-600" size={24} /> Pet Details
              </h3>

              <InputForm
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Pet's Name"
                Icon={Heart}
                required={true}
              />

              {/* Type Select */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Tag className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                >
                  <option value="" disabled>
                    -- Select Pet Type --
                  </option>
                  {PET_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <InputForm
                name="breed"
                type="text"
                value={formData.breed}
                onChange={handleChange}
                placeholder="Breed (optional)"
                Icon={PawPrint}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputForm
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Age (years)"
                  Icon={Calendar}
                  min={0}
                  required={true}
                />
                <InputForm
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Weight (kg)"
                  Icon={Scale}
                  min={0}
                  required={true}
                />
              </div>

              {/* Gender Select */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <UserPlus className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                >
                  <option value="" disabled>
                    -- Select Gender --
                  </option>
                  {PET_GENDER.map((gen) => (
                    <option key={gen.value} value={gen.value}>
                      {gen.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Notes (Textarea) */}
              <label
                htmlFor="special-notes"
                className="text-sm font-semibold text-gray-700 mt-4 flex items-center gap-1 pt-2 border-t"
              >
                <FileText className="w-4 h-4 text-indigo-500" /> Special Notes
              </label>
              <textarea
                id="special-notes"
                name="specialNotes"
                rows={3}
                value={formData.specialNotes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specialNotes: e.target.value,
                  }))
                }
                placeholder="Health, history, personality, etc. (Max 255 characters)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 resize-none"
                maxLength={255}
              />
            </div>
          </div>

          {/* Footer (Nút Save/Cancel) */}
          <div className="w-full p-4 flex justify-end gap-4 border-t border-gray-200 bg-white rounded-b-xl">
            <button
              type="submit"
              disabled={isloading}
              className={` button-black text-white font-bold px-6 py-2 rounded-lg 
              disabled:cursor-not-allowed disabled:bg-gray-500`}
            >
              {isloading ? (
                <div className="flex justify-center items-center">
                  <Loader2 />
                </div>
              ) : (
                <>
                  <Save size={20} className="mr-2 inline-block" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
