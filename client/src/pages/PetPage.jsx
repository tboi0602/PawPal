import { useCallback, useEffect, useState } from "react";
import { getPets } from "../services/users/petAPI";
import { getItem } from "../utils/operations";
import { Loader } from "../components/models/Loaders/Loader";
import { AddPetModel } from "../components/models/Users/Pets/AddPetModel";
import { EditPetModel } from "../components/models/Users/Pets/EditPetModel";

import {
  Cat,
  PawPrint,
  Heart,
  Scale,
  Calendar,
  Tag,
  UserPlus,
  CirclePlus,
  NotebookText,
} from "lucide-react";

export const PetPage = () => {
  const userId = getItem("user-data")?._id;
  const [pets, setPets] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // Load pet
  const loadPets = useCallback(async () => {
    if (!userId) {
      setMessage("User ID not found. Please log in.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await getPets(userId);
      if (!data.success) {
        setMessage("You don't have any pets yet !");
        setPets([]);
        return;
      }
      setPets(data.pets);
      setMessage("");
    } catch (error) {
      setMessage("Failed to fetch pets: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Firt run
  useEffect(() => {
    loadPets();
  }, [loadPets]);

  //add
  const handleAdd = () => {
    setOpenAdd(true);
  };
  const handleEdit = () => {
    setOpenEdit(true);
  };

  return (
    <>
      <div className="relative p-8 md:p-16 w-full flex flex-col items-center min-h-screen bg-gray-50">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-8 border-b-4 border-black pb-2">
          <PawPrint className="inline-block w-10 h-10 mr-2 text-black" />
          My Lovely Pets
        </h1>
        <button
          className=" flex gap-1 items-center justify-center text-2xl mb-8 font-semibold bg-green-600 
      hover:bg-green-800 p-2 px-4 rounded-lg cursor-pointer duration-300 text-white "
          onClick={handleAdd}
        >
          <CirclePlus />
          New Pet
        </button>

        {/* Loading & Message Area */}
        {isLoading && (
          <div className="my-10">
            <Loader />
          </div>
        )}

        {pets?.length == 0 && !isLoading && (
          <p className="text-red-600 text-xl font-medium p-4 bg-red-100 rounded-lg shadow-md">
            {message}
          </p>
        )}

        {/* Grid Container */}
        <div
          className={`w-full max-w-5xl grid gap-8 p-4 ${
            pets?.length === 1
              ? "grid-cols-1 max-w-xl"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
          }`}
        >
          {pets?.length > 0 &&
            pets.map((pet, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden  border border-gray-100"
              >
                {/* Pet Card Header: Image & Type */}
                <div className="relative h-[500px] w-full">
                  {pet.image ? (
                    <img
                      src={pet.image}
                      alt={`Avatar of ${pet.name}`}
                      className="w-full h-full object-cover hover:scale-105 duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex justify-center items-center">
                      <Cat className="w-1/3 h-1/3 text-gray-500" />
                    </div>
                  )}
                  {/* Pet Type Tag */}
                  <div className="absolute text-md left-3 top-3 bg-black px-3 py-1 text-white rounded-full font-semibold shadow-md">
                    {pet?.type || "Unknown Type"}
                  </div>
                  <div
                    className="absolute text-xl right-3 bottom-3 backdrop-blur-xs px-4 py-1 rounded-lg 
                font-semibold shadow-md cursor-pointer hover:bg-white/40 transition-all border border-black"
                    onClick={handleEdit}
                  >
                    Edit
                  </div>
                  {openEdit && (
                    <EditPetModel
                      userId={userId}
                      pet={pet}
                      reloadPets={loadPets}
                      setOpenEdit={setOpenEdit}
                    />
                  )}
                </div>

                {/* Pet Card Body: Details */}
                <div className="p-5 flex flex-col gap-3">
                  {/* Pet Name */}
                  <h2 className="text-3xl font-extrabold text-black flex items-center border-b pb-2">
                    <Heart className="w-6 h-6 mr-2 text-red-500" />
                    {pet?.name || "No Name"}
                  </h2>

                  <div className="grid grid-cols-2 gap-y-3">
                    {/* Breed */}
                    <div className="flex items-center text-gray-700">
                      <Tag className="w-5 h-5 mr-2 text-blue-500" />
                      <span className="font-semibold">Breed:</span>
                      <span className="ml-2 truncate">
                        {pet?.breed || "Unknown"}
                      </span>
                    </div>

                    {/* Gender */}
                    <div className="flex items-center text-gray-700">
                      <UserPlus className="w-5 h-5 mr-2 text-pink-500" />
                      <span className="font-semibold">Gender:</span>
                      <span className="ml-2">
                        {pet?.gender ? "Male" : "Female"}
                      </span>
                    </div>

                    {/* Age */}
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                      <span className="font-semibold">Age:</span>
                      <span className="ml-2">{pet?.age || "Unknown"}</span>
                    </div>

                    {/* Weight */}
                    <div className="flex items-center text-gray-700">
                      <Scale className="w-5 h-5 mr-2 text-green-500" />
                      <span className="font-semibold">Weight:</span>
                      <span className="ml-2">
                        {pet?.weight || "Unknown"}
                        {pet?.weight && " kg"}
                      </span>
                    </div>

                    {/* Special Notes */}
                    <div className="col-span-2 mt-3 p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded-md">
                      <div className="flex items-center text-indigo-700 font-bold mb-1">
                        <NotebookText className="w-5 h-5 mr-2" />
                        Special Notes
                      </div>
                      <p className="text-sm text-indigo-800 italic line-clamp-2">
                        {pet.specialNotes || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      {openAdd && (
        <AddPetModel
          userId={userId}
          reloadPets={loadPets}
          setOpenAdd={setOpenAdd}
        />
      )}
    </>
  );
};
