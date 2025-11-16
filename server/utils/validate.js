export const validatePassword = (password) => {
  const minLength = /.{8,}/;
  const uppercase = /(?=.*[A-Z])/;
  const lowercase = /(?=.*[a-z])/;
  const number = /(?=.*\d)/;
  const specialChar = /(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?~`])/;

  return (
    minLength.test(password) &&
    uppercase.test(password) &&
    lowercase.test(password) &&
    number.test(password) &&
    specialChar.test(password)
  );
};
