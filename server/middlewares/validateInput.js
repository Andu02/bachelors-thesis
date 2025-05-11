function validateUsername(username) {
  return (
    typeof username === "string" &&
    username.length >= 3 &&
    username.length <= 20
  );
}

function validatePasswordByMethod(password, method) {
  const onlyLettersMethods = [
    "caesar",
    "vigenere",
    "hill",
    "affine",
    "transposition",
    "permutation",
  ];

  if (onlyLettersMethods.includes(method)) {
    return /^[a-zA-Z]+$/.test(password);
  }

  const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  return strongPasswordRegex.test(password);
}

export function getPasswordErrorMessage(password, method) {
  if (!validatePasswordByMethod(password, method)) {
    return method === "caesar" || method === "vigenere" || method === "hill"
      ? "Parola trebuie să conțină doar litere."
      : "Parola trebuie să aibă minim 8 caractere, o literă mare, o cifră și un caracter special.";
  }
  return null;
}

export function validateRegisterFields(req, res, next) {
  const { username, password, method } = req.body;

  if (!validateUsername(username)) {
    return res.render("register", {
      message: "Username-ul trebuie să aibă între 3 și 20 de caractere.",
    });
  }

  if (!method || method === "") {
    return res.render("register", {
      message: "Te rugăm să alegi o metodă de criptare.",
    });
  }

  const errorMessage = getPasswordErrorMessage(password, method);
  if (errorMessage) {
    return res.render("register", { message: errorMessage });
  }

  next();
}

export function validateNewPassword(req, res, next) {
  const { newPassword, method } = req.body;

  const errorMessage = getPasswordErrorMessage(newPassword, method);
  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  next();
}
