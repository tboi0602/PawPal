export const validatePassword = (password) => {
  const minLength = /.{8,}/;
  const uppercase = /(?=.*[A-Z])/;
  const lowercase = /(?=.*[a-z])/;
  const number = /(?=.*\d)/;
  const specialChar = /(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?~`])/;

  return {
    minLength: minLength.test(password),
    uppercase: uppercase.test(password),
    lowercase: lowercase.test(password),
    number: number.test(password),
    specialChar: specialChar.test(password),
    isValid:
      minLength.test(password) &&
      uppercase.test(password) &&
      lowercase.test(password) &&
      number.test(password) &&
      specialChar.test(password),
  };
};
