import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/success-register", (req, res) => {
  const details = req.cookies.registrationDetails
    ? JSON.parse(req.cookies.registrationDetails)
    : null;

  if (!details) return res.redirect("/register");
  res.render("success-register", { details });
});

export default router;
