import { Mail, MapPin, Phone, Send } from "lucide-react";

export const Contact = () => {
  return (
    <div
      id="contact"
      className="flex flex-col justify-center items-center p-32 border"
    >
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-7xl font-bold">Contact us</h1>
        <p className="text-2xl">
          Have any questions? Don't hesitate to contact our friendly support
          team.
        </p>
      </div>
      <div className="grid grid-cols-2 w-full gap-4 mt-8">
        <div className="flex flex-col border border-black/10 rounded-lg p-4 gap-4">
          <div className="text-2xl font-medium">Contact information</div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Phone className="w-4 text-black/70" />
              <p className="text-black/60">0898672xxx</p>
            </div>
            <div className="flex gap-2">
              <Mail className="w-4 text-black/70" />
              <p className="text-black/60">pawpal@support.com</p>
            </div>
            <div className="flex gap-2">
              <MapPin className="w-4 text-black/70" />
              <p className="text-black/60">
                Đường A, phường B, quận C, thành phố D{" "}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col border border-black/10 rounded-lg p-4 gap-4">
          <div className="text-2xl font-medium">Send us a message</div>
          <div className="flex flex-col text-black/60 gap-2">
            <label>Full name</label>
            <input
              type="text"
              className="outline-none rounded-md p-2 px-3 border border-black/20 hover:border-black/60 focus:border-black/60"
              placeholder="Enter your name"
            />
            <label>Email</label>
            <input
              type="email"
              className="outline-none rounded-md p-2 px-3 border border-black/20 hover:border-black/60 focus:border-black/60"
              placeholder="Enter your email"
            />
            <label>Message</label>
            <textarea
              type="text"
              className="outline-none rounded-md p-2 px-3 border border-black/20 hover:border-black/60 focus:border-black/60"
              placeholder="Enter your name"
            />
          </div>
          <button className="button-black p-2 rounded-lg flex justify-center items-center gap-1 ">
            <p className="text-xl">Send</p>
            <Send className="w-4"/>
          </button>
        </div>
      </div>
    </div>
  );
};
