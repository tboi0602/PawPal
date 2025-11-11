import { useEffect, useState } from "react";
import { getUser } from "../../../services/users/userAPI";
import {
  X,
  MapPin,
  Phone,
  Star,
  PawPrint,
  Shield,
  Image as ImageIcon,
  IdCard,
  Mail,
  User,
} from "lucide-react";

export const UserDetailsModel = ({ userId, setOpenDetails }) => {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [message, setMessage] = useState("");

  // Load user info và pet info
  useEffect(() => {
    const loadData = async () => {
      // Load User
      const userRes = await getUser(userId);
      if (!userRes.success) {
        setMessage(userRes.message);
        return;
      }
      setUser(userRes.user);
      setPets(userRes.user.pets || []);
    };
    loadData();
  }, [userId]);

  const DetailItem = ({ Icon, label, value }) => (
    <div className="flex items-center gap-2 p-3 transition border-b border-neutral-100 last:border-b-0">
      <Icon size={18} className="text-neutral-600" />
      <span className="font-medium text-neutral-800 w-24 shrink-0">
        {label}:
      </span>
      <span className="text-black wrap-break-words grow">{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
      <div className="relative z-50 w-full max-w-4xl bg-white text-black shadow-2xl rounded-2xl p-6 overflow-y-auto max-h-[90vh] transition-all duration-300 transform scale-100">
        {/* Close button */}
        <X
          className="absolute top-4 right-4 cursor-pointer text-neutral-600 hover:text-black transition duration-200"
          onClick={() => setOpenDetails(false)}
          size={24}
        />

        {/* Header */}
        <h2 className="text-3xl font-extrabold mb-6 text-center text-black">
          User Profile Details
        </h2>

        {/* Message if error (khi user null do lỗi) */}
        {!user ? (
          <div className="text-center p-10 text-black font-semibold">
            {message || "User data could not be loaded."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border border-neutral-300 rounded-xl p-4 md:p-6 bg-neutral-50">
              <div className="flex flex-col items-center justify-start py-4 bg-white rounded-lg shadow-md border border-neutral-200 lg:col-span-1">
                {/* Avatar */}
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-black shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-neutral-100 flex items-center justify-center text-black border-4 border-black">
                    <ImageIcon size={48} />
                  </div>
                )}

                {/* Basic Info */}
                <h3 className="mt-4 text-2xl font-bold text-black">
                  {user?.name}
                </h3>
                <p
                  className={`text-sm font-medium px-3 py-1 rounded-full mt-2 border ${
                    user.role === "ADMIN"
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black"
                  }`}
                >
                  <Shield size={14} className="inline-block mr-1" />
                  {user.role}
                </p>

                <div className="mt-4 text-center text-neutral-700 space-y-1">
                  <p className="flex items-center gap-2 justify-center">
                    <Star size={16} className="text-neutral-600" />
                    <span className="font-bold">
                      {user.loyaltyPoints ?? 0}
                    </span>{" "}
                    Points
                  </p>
                  <p className="flex items-center gap-2 justify-center text-sm">
                    <Mail size={16} className="text-neutral-500" />{" "}
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden">
                  <h4 className="font-bold text-lg p-3 bg-black/80 text-white">
                    Contact & System Details
                  </h4>
                  <div className="divide-y divide-neutral-100">
                    <DetailItem
                      Icon={IdCard}
                      label="User ID"
                      value={user._id}
                    />
                    <DetailItem
                      Icon={Phone}
                      label="Phone"
                      value={user.phone || "N/A"}
                    />
                    <DetailItem
                      Icon={MapPin}
                      label="Address"
                      value={user.address?.[0] || "No address provided"}
                    />
                    <DetailItem Icon={User} label="Role" value={user.role} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden">
                  <h4 className="font-bold text-lg  p-3 bg-black/80 text-white flex items-center gap-2">
                    <PawPrint size={18} /> Pet Information
                  </h4>
                  <div className="p-4">
                    {pets.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {pets.map((pet, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 border border-neutral-300 rounded-lg bg-white hover:bg-neutral-50 transition duration-150"
                          >
                            <span className="font-semibold text-black">
                              {pet.name}
                            </span>
                            <span className="text-neutral-700 text-sm font-medium">
                              {pet.species || pet.type || "Unknown Species"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-600 text-center py-4">
                        <PawPrint
                          size={20}
                          className="inline mr-2 text-neutral-500"
                        />
                        This user has no registered pets.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
