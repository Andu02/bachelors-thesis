// ============================
// Importuri necesare
// ============================
import { body, validationResult } from "express-validator";
import { gcd } from "../utils/utils.js";

// ============================
// Expresii regulate reutilizabile
// ============================
const onlyLettersRegex = /^[A-Za-z]+$/;
const strongPwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

// ============================
// Validator personalizat pentru parola
// ============================
function passwordByMethodValidator(pwd, { req }) {
  const m = req.body.method;
  if (["caesar", "vigenere", "hill", "affine"].includes(m)) {
    if (!onlyLettersRegex.test(pwd)) {
      throw new Error("Parola trebuie să conțină doar litere.");
    }
  } else {
    if (!strongPwdRegex.test(pwd)) {
      throw new Error(
        "Parola trebuie să aibă minim 8 caractere, o literă mare, o cifră și un caracter special."
      );
    }
  }
  return true;
}

// ============================
// Validator pentru înregistrare
// ============================
export const registerValidator = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username-ul trebuie să aibă între 3 și 20 caractere."),

  body("method")
    .isIn(["caesar", "affine", "hill", "ecb", "cbc", "rsa", "bcrypt", "sha256"])
    .withMessage("Metodă de criptare necunoscută."),

  body("password").custom(passwordByMethodValidator),

  body("caesarKey")
    .if(body("method").equals("caesar"))
    .isInt({ min: 1, max: 25 })
    .withMessage("Cheia Caesar trebuie să fie între 1 și 25."),

  body("affineA")
    .if(body("method").equals("affine"))
    .isInt({ min: 1, max: 25 })
    .custom((a) => gcd(BigInt(a), 26n) === 1n)
    .withMessage("Coeficientul ‘a’ trebuie prim cu 26."),

  body("affineB")
    .if(body("method").equals("affine"))
    .isInt({ min: 0, max: 25 })
    .withMessage("Coeficientul ‘b’ trebuie între 0 și 25."),

  body("hill")
    .if(body("method").equals("hill"))
    .notEmpty()
    .withMessage("Matricea Hill este necesară.")
    .bail()
    .custom((h) => {
      const m = typeof h === "string" ? JSON.parse(h) : h;
      if (
        !Array.isArray(m) ||
        m.length === 0 ||
        !Array.isArray(m[0]) ||
        m.length !== m[0].length
      ) {
        throw new Error("Matricea Hill trebuie pătratică.");
      }
      return true;
    }),

  body("symmetricKey")
    .if(body("method").isIn(["ecb", "cbc"]))
    .notEmpty()
    .withMessage("Cheia simetrică este obligatorie."),

  body("rsa.p")
    .if(body("method").equals("rsa"))
    .exists({ checkFalsy: true })
    .withMessage("Parametrul p este necesar."),

  body("rsa.q")
    .if(body("method").equals("rsa"))
    .exists({ checkFalsy: true })
    .withMessage("Parametrul q este necesar."),

  body("rsa.e")
    .if(body("method").equals("rsa"))
    .exists({ checkFalsy: true })
    .withMessage("Parametrul e este necesar."),

  body("bcryptSalt")
    .if(body("method").equals("bcrypt"))
    .isInt({ min: 4, max: 14 })
    .withMessage("Salt bcrypt trebuie între 4 și 14."),

  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ message: errs.array()[0].msg });
    }
    next();
  },
];

// ============================
// Validator pentru schimbarea parolei
// ============================
export const changePasswordValidator = [
  body("method")
    .isIn([
      "caesar",
      "vigenere",
      "hill",
      "affine",
      "ecb",
      "cbc",
      "rsa",
      "bcrypt",
      "sha256",
    ])
    .withMessage("Metodă de criptare necunoscută."),

  body("oldPassword").isString().withMessage("Parola veche este obligatorie."),

  body("newPassword").custom((newPwd, { req }) => {
    const m = req.body.method;
    if (["caesar", "vigenere", "hill", "affine"].includes(m)) {
      if (!onlyLettersRegex.test(newPwd)) {
        throw new Error("Parola trebuie să conțină doar litere.");
      }
    } else {
      if (!strongPwdRegex.test(newPwd)) {
        throw new Error(
          "Parola nouă trebuie să aibă minim 8 caractere, o literă mare, o cifră și un caracter special."
        );
      }
    }
    return true;
  }),

  body("caesarKey")
    .if(body("method").equals("caesar"))
    .isInt({ min: 1, max: 25 })
    .withMessage("Cheia Caesar trebuie să fie între 1 și 25."),

  body("affineA")
    .if(body("method").equals("affine"))
    .isInt({ min: 1, max: 25 })
    .custom((a) => gcd(BigInt(a), 26n) === 1n)
    .withMessage("a trebuie prim cu 26."),

  body("affineB")
    .if(body("method").equals("affine"))
    .isInt({ min: 0, max: 25 })
    .withMessage("b trebuie între 0 și 25."),

  body("hill")
    .if(body("method").equals("hill"))
    .notEmpty()
    .withMessage("Matricea Hill este necesară.")
    .bail()
    .custom((h) => {
      const m = typeof h === "string" ? JSON.parse(h) : h;
      if (!Array.isArray(m) || m.length === 0 || m.length !== m[0]?.length) {
        throw new Error("Matricea Hill trebuie pătratică.");
      }
      return true;
    }),

  body("symmetricKey")
    .if(body("method").isIn(["ecb", "cbc"]))
    .notEmpty()
    .withMessage("Cheia simetrică este obligatorie."),

  body(["rsa.p", "rsa.q", "rsa.e"])
    .if(body("method").equals("rsa"))
    .exists({ checkFalsy: true })
    .withMessage("RSA necesită p, q și e."),

  body("bcryptSalt")
    .if(body("method").equals("bcrypt"))
    .isInt({ min: 4, max: 14 })
    .withMessage("Salt bcrypt trebuie să fie între 4 și 14."),

  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ message: errs.array()[0].msg });
    }
    next();
  },
];
