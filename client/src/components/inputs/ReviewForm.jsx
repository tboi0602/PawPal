import { useState } from "react";
import { Star } from "lucide-react";
import { addReview } from "../../services/shopping/reviewAPI";
import { getItem } from "../../utils/operations";
import { MarkdownForm } from "./MarkdownForm";
import { Loader2 } from "../models/Loaders/Loader2";
import Swal from "sweetalert2";

export const ReviewForm = ({ productId, reloadReview }) => {
  const [comment, setComment] = useState("");
  const [rate, setRate] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const user = getItem("user-data");
  const currentUserId = user?._id;

  const totalStars = 5;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUserId || !productId) {
      return setError("Please log in to submit a review.");
    }
    if (rate === 0) {
      return setError("Please select a rating (1-5 stars).");
    }
    if (comment.trim() === "") {
      return setError("Comment cannot be empty.");
    }

    setIsSubmitting(true);
    try {
      const result = await addReview(
        productId,
        user.name,
        user.image,
        comment,
        rate
      );

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "bottom-right",
          icon: "success",
          title: result.message,
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
        });
        setComment("");
        setRate(0);
        reloadReview(productId, 1, 10);
      } else {
        setError(result.message || "Failed to submit review.");
      }
    } catch (err) {
      setError("Server error during submission.");
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 border border-indigo-200 rounded-xl  mb-8 shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            Your Rating:
          </label>
          <div className="flex space-x-0.5 cursor-pointer">
            {[...Array(totalStars)].map((_, index) => {
              const starValue = index + 1;
              return (
                <Star
                  key={index}
                  onClick={() => setRate(starValue)}
                  className={
                    starValue <= rate
                      ? "text-yellow-500 fill-amber-400 transition"
                      : "text-gray-400 hover:text-yellow-400 transition"
                  }
                  size={24}
                />
              );
            })}
          </div>
          <span className="text-lg font-semibold ml-2 text-gray-800">
            ({rate} / 5)
          </span>
        </div>
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Comment:
          </label>
          <MarkdownForm handleEditorChange={(content) => setComment(content)} />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full px-4 button-black py-3 rounded-lg disabled:bg-indigo-400 flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader2 /> Submitting...
            </span>
          ) : (
            "Submit Review"
          )}
        </button>
      </form>
    </div>
  );
};
