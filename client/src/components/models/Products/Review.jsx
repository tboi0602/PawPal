import { useMemo } from "react";
import { Star, Trash } from "lucide-react";
import { ReviewForm } from "../../inputs/ReviewForm";
import { deleteReview } from "../../../services/shopping/reviewAPI";
import Swal from "sweetalert2";
import { getItem } from "../../../utils/operations";

const StarRating = ({ rate }) => {
  const totalStars = 5;
  return (
    <div className="flex items-center space-x-0.5">
      {[...Array(totalStars)].map((_, index) => {
        const currentRate = index + 1;
        return (
          <Star
            key={index}
            className={
              currentRate <= rate
                ? "text-yellow-400 fill-amber-300"
                : "text-gray-300"
            }
            size={16}
          />
        );
      })}
    </div>
  );
};

const AverageRatingDisplay = ({ averageRate, totalReviews }) => {
  const displayRate = averageRate.toFixed(1);
  const progressBarWidth = `${(averageRate / 5) * 100}%`;

  return (
    <div className="flex items-center space-x-4 mb-4 p-4 border border-yellow-300 rounded-lg bg-yellow-50">
      <div className="flex gap-2 items-center">
        <span className="text-5xl font-extrabold text-gray-800">
          {displayRate}
        </span>
        <span className="text-lg text-gray-500">/ 5</span>
      </div>

      <div className="flex flex-col grow space-y-1">
        <StarRating rate={Math.round(averageRate)} />

        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-500"
            style={{ width: progressBarWidth }}
          />
        </div>

        <p className="text-sm text-gray-600 font-medium mt-1">
          Based on {totalReviews} evaluate
        </p>
      </div>
    </div>
  );
};

export const Review = ({
  productId,
  reviews,
  setReviews,
  reloadReview,
  handleChangePage,
}) => {
  const userId = getItem("user-data")?._id || "GUEST";
  const { averageRate, totalReviews } = useMemo(() => {
    if (reviews?.length === 0) {
      return { averageRate: 0, totalReviews: 0 };
    }
    const totalStars = reviews?.reduce((sum, review) => sum + review?.rate, 0);
    const average = totalStars / reviews?.length;
    return { averageRate: average, totalReviews: reviews?.length };
  }, [reviews]);

  if (!reviews | (reviews?.length === 0)) {
    return (
      <div className="max-w-full mx-auto p-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No reviews yet
        </h3>
        <p className="text-sm text-gray-500">
          Be the first to share your thoughts on this product!
        </p>
        <ReviewForm productId={productId} reloadReview={reloadReview} />
      </div>
    );
  }

  const handleSeeMore = () => {
    handleChangePage();
  };

  const handleDelete = async (reviewId) => {
    const data = await deleteReview(reviewId);
    if (data.success) {
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "success",
        title: data.message,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });
      setReviews();
      reloadReview(productId, 1, 10);
    }
  };
  return (
    <div className="w-full mx-auto p-6 bg-white shadow-2xl rounded-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b  pb-2">
        📝 Customer Reviews
      </h2>
      {/* Hiển thị Điểm Trung Bình */}
      <AverageRatingDisplay
        averageRate={averageRate}
        totalReviews={totalReviews}
      />
      <ReviewForm productId={productId} reloadReview={reloadReview} />
      {/* Danh sách Reviews */}
      <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-4">
        {totalReviews} detailed review
      </h3>
      <div className="space-y-6">
        {reviews?.map((review, index) => (
          <div
            key={index}
            className="p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white transition duration-200"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2 justify-center items-center ">
                <img
                  src={review?.user?.image}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <p className="font-semibold text-indigo-600 text-sm">
                  {review?.user?.name ||
                    `User ID: ${
                      review?.user?.id
                        ? review?.user?.id.substring(0, 10)
                        : "CLIENT"
                    } `}
                </p>
              </div>
              <StarRating rate={review?.rate} />
            </div>

            <div
              dangerouslySetInnerHTML={{
                __html: review.comment,
              }}
              className="text-gray-700 text-sm italic mb-3 leading-relaxed border-l-4 border-gray-200 pl-3 "
            ></div>

            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>
                Rated on:
                <span className="font-medium ml-1">
                  {review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </span>
              {userId === review?.user?.id && (
                <Trash
                  className="w-4 h-4 text-red-400 hover:text-red-700 cursor-pointer duration-150"
                  onClick={() => handleDelete(review._id)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        className="w-full mt-4 button-black p-2 font-medium rounded-lg"
        onClick={handleSeeMore}
      >
        SEE MORE
      </button>
    </div>
  );
};
