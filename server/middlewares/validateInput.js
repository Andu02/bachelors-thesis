import { validateUsername, validatePassword } from "../utils/validators.js";

export function validateRegisterFields(req, res, next) {
  const { username, password } = req.body;

  if (!validateUsername(username)) {
    return res.render("register", {
      message: "Username-ul trebuie să aibă între 3 și 20 de caractere.",
    });
  }

  if (!validatePassword(password)) {
    return res.render("register", {
      message: "Parola trebuie să aibă între 6 și 30 de caractere.",
    });
  }

  next();
}

export function validateNewPassword(req, res, next) {
  const { newPassword } = req.body;

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      message: "Parola nouă trebuie să aibă între 6 și 30 de caractere.",
    });
  }

  next();
}
