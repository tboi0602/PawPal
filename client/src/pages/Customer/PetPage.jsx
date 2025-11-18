import { useCallback, useEffect, useState } from "react";
import { getPets } from "../../services/users/petAPI";
import { getItem } from "../../utils/operations";
import { Loader } from "../../components/models/Loaders/Loader";
import { AddPetModel } from "../../components/models/Users/Pets/AddPetModel";
import { EditPetModel } from "../../components/models/Users/Pets/EditPetModel";

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
  const [editPet, setEditPet] = useState(null);

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
  const handleAdd = () => setOpenAdd(true);
  const handleEdit = (pet) => {
    setEditPet(pet);
    setOpenEdit(true);
  };

  return (
    <>
      <div className="relative py-12 px-6 md:px-12 w-full min-h-screen bg-linear-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              My Lovely Pets
            </h1>

            <div className="flex gap-3">
              <button
                className="inline-flex gap-2 items-center justify-center text-lg 
                font-semibold button-black px-4 py-2 rounded-lg shadow-md transition"
                onClick={handleAdd}
              >
                <CirclePlus className="w-5 h-5" /> New Pet
              </button>
            </div>
          </div>

          {/* Loading & Message Area */}
          {isLoading && (
            <div className="my-10">
              <Loader />
            </div>
          )}

          {pets?.length == 0 && !isLoading && (
            <p className="  text-xl  p-4 rounded-lg  shadow-md">{message}</p>
          )}

          {/* Grid Container */}
          <div
            className={`w-full grid gap-8 p-4 ${
              pets?.length === 1
                ? "grid-cols-1 max-w-xl mx-auto"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {pets?.length > 0 &&
              pets.map((pet, index) => (
                <div
                  key={pet._id || index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition"
                >
                  {/* Pet Card Header: Image & Type */}
                  <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden">
                    {pet.image ? (
                      <img
                        src={pet.image}
                        alt={`Avatar of ${pet.name}`}
                        className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex justify-center items-center">
                        <Cat className="w-20 h-20 text-gray-400" />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 bg-black/80 px-3 py-1 text-white rounded-full font-semibold shadow">
                      {pet?.type || "Unknown"}
                    </div>

                    <button
                      onClick={() => handleEdit(pet)}
                      className="absolute right-3 bottom-3 bg-white/90 px-3 py-1 rounded-lg font-semibold text-sm border border-gray-200 shadow hover:bg-white transition"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Pet Card Body: Details */}
                  <div className="p-5 flex flex-col gap-3">
                    <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />{" "}
                      {pet?.name || "No Name"}
                    </h2>

                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-xs text-gray-500">Breed</div>
                          <div className="font-medium truncate max-w-40">
                            {pet?.breed || "Unknown"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-pink-500" />
                        <div>
                          <div className="text-xs text-gray-500">Gender</div>
                          <div className="font-medium">
                            {pet?.gender ? "Male" : "Female"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <div>
                          <div className="text-xs text-gray-500">Age</div>
                          <div className="font-medium">
                            {pet?.age || "Unknown"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="text-xs text-gray-500">Weight</div>
                          <div className="font-medium">
                            {pet?.weight ? `${pet.weight} kg` : "Unknown"}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 mt-2 p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded-md">
                        <div className="flex items-center text-indigo-700 font-bold mb-1">
                          <NotebookText className="w-4 h-4 mr-2" />
                          Special Notes
                        </div>
                        <p className="text-sm text-indigo-800 italic line-clamp-3">
                          {pet.specialNotes || "No notes"}
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
        {openEdit && editPet && (
          <EditPetModel
            userId={userId}
            pet={editPet}
            reloadPets={loadPets}
            setOpenEdit={(val) => {
              setOpenEdit(val);
              if (!val) setEditPet(null);
            }}
          />
        )}
      </div>
    </>
  );
};
