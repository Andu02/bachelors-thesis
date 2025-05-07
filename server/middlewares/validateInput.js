function validateUsername(username) {
  return (
    typeof username === "string" &&
    username.length >= 3 &&
    username.length <= 20
  );
}

function validatePassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 6 &&
    password.length <= 30
  );
}

export function validateRegisterFields(req, res, next) {
  const { username, password, method } = req.body;

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

  if (!method || method === "") {
    return res.render("register", {
      message: "Te rugăm să alegi o metodă de criptare.",
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
