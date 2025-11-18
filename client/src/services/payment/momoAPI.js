export async function generateMoMO(
  orderId,
  amount,
  orderInfo,
  isServiceBooking = false
) {
  const res = await fetch(
    `http://localhost:5000/api-payment/payments/momo/create`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        orderId,
        amount,
        orderInfo,
        isServiceBooking,
      }),
    }
  );
  return res.json();
}

export async function resultMoMO() {
  const queryString = window.location.search;
  const apiUrl = `http://localhost:5000/api-payment/payments/momo/results${queryString}`;
  const res = await fetch(apiUrl, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
}
