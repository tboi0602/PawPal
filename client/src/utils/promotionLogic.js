
export const calculateDiscountAmount = (promo, subtotal) => {
  if (promo.status !== "active" || subtotal < promo.minOrderAmount) {
    return 0;
  }

  let actualDiscount = 0;
  if (promo.discountType === "fixed") {
    actualDiscount = promo.discountValue;
  } else if (promo.discountType === "percent") {
    const calculatedDiscount = (subtotal * promo.discountValue) / 100;
    actualDiscount = Math.min(calculatedDiscount, promo.maxDiscountAmount);
  }
  return Math.max(0, actualDiscount);
};


export function filterAndFindBestPromo(promotions, subtotal, userRank = "All") {
  let bestPromo = null;
  let maxAmount = 0;
  const availableList = [];

  promotions.map((promo) => {
    if (promo.status !== "active") return;
    if (promo.rank !== "All" && promo.rank !== userRank) return;

    const actualDiscount = calculateDiscountAmount(promo, subtotal);
    if (actualDiscount > 0) {
      availableList.push({ ...promo, actualDiscount });

      if (actualDiscount > maxAmount) {
        maxAmount = actualDiscount;
        bestPromo = { ...promo, actualDiscount };
      }
    }
  });

  return {
    bestPromo,
    maxAmount,
    availableList: availableList.sort((a, b) => b.actualDiscount - a.actualDiscount),
  };
}