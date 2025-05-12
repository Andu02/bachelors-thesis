import { body, validationResult } from "express-validator";
import { gcd } from "../utils/utils.js";

// shared regexes
const onlyLettersRegex = /^[A-Za-z]+$/;
const strongPwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

// single custom validator for any password field
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

export const registerValidator = [
  // username
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username-ul trebuie să aibă între 3 și 20 caractere."),

  // method
  body("method")
    .isIn(["caesar", "affine", "hill", "ecb", "cbc", "rsa", "bcrypt", "sha256"])
    .withMessage("Metodă de criptare necunoscută."),

  // password
  body("password").custom(passwordByMethodValidator),

  // Caesar key
  body("caesarKey")
    .if(body("method").equals("caesar"))
    .isInt({ min: 1, max: 25 })
    .withMessage("Cheia Caesar trebuie să fie între 1 și 25."),

  // Affine keys
  body("affineA")
    .if(body("method").equals("affine"))
    .isInt({ min: 1, max: 25 })
    .custom((a) => gcd(BigInt(a), 26n) === 1n)
    .withMessage("Coeficientul ‘a’ trebuie prim cu 26."),
  body("affineB")
    .if(body("method").equals("affine"))
    .isInt({ min: 0, max: 25 })
    .withMessage("Coeficientul ‘b’ trebuie între 0 și 25."),

  // Hill matrix
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

  // ECB/CBC symmetric key
  body("symmetricKey")
    .if(body("method").isIn(["ecb", "cbc"]))
    .notEmpty()
    .withMessage("Cheia simetrică este obligatorie."),

  // RSA params (inside req.body.rsa)
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

  // bcrypt salt rounds
  body("bcryptSalt")
    .if(body("method").equals("bcrypt"))
    .isInt({ min: 4, max: 14 })
    .withMessage("Salt bcrypt trebuie între 4 și 14."),

  // final error collector
  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      // JSON-based register
      return res.status(400).json({ message: errs.array()[0].msg });
    }
    next();
  },
];

export const changePasswordValidator = [
  // must supply a method
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

  // oldPassword required
  body("oldPassword").isString().withMessage("Parola veche este obligatorie."),

  // newPassword strength per‐method
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

  // Caesar key if needed
  body("caesarKey")
    .if(body("method").equals("caesar"))
    .isInt({ min: 1, max: 25 })
    .withMessage("Cheia Caesar trebuie să fie între 1 și 25."),

  // Affine params if needed
  body("affineA")
    .if(body("method").equals("affine"))
    .isInt({ min: 1, max: 25 })
    .custom((a) => gcd(BigInt(a), 26n) === 1n)
    .withMessage("a trebuie prim cu 26."),
  body("affineB")
    .if(body("method").equals("affine"))
    .isInt({ min: 0, max: 25 })
    .withMessage("b trebuie între 0 și 25."),

  // Hill matrix
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

  // Symmetric key
  body("symmetricKey")
    .if(body("method").isIn(["ecb", "cbc"]))
    .notEmpty()
    .withMessage("Cheia simetrică este obligatorie."),

  // RSA params
  body(["rsa.p", "rsa.q", "rsa.e"])
    .if(body("method").equals("rsa"))
    .exists({ checkFalsy: true })
    .withMessage("RSA necesită p, q și e."),

  // bcrypt salt
  body("bcryptSalt")
    .if(body("method").equals("bcrypt"))
    .isInt({ min: 4, max: 14 })
    .withMessage("Salt bcrypt trebuie să fie între 4 și 14."),

  // finally send back the first error as JSON
  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ message: errs.array()[0].msg });
    }
    next();
  },
];
