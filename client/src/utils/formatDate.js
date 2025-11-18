export const formatDate = (dateInput, format = "dd/mm/yyyy HH:MM:ss") => {
  let date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === "string" || typeof dateInput === "number") {
    date = new Date(dateInput);
  } else {
    return "Invalid Date";
  }

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  // *** SỬ DỤNG PHƯƠNG THỨC UTC ***
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getUTCFullYear().toString();
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");

  let formattedDate = format
    .replace("dd", day)
    .replace("mm", month)
    .replace("yyyy", year)
    .replace("HH", hours)
    .replace("MM", minutes)
    .replace("ss", seconds);

  return formattedDate;
};
