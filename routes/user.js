let router = require("express").Router();

//회원 가입 기능
// "/signin" 이동
router.get("/signin", (req, res) => {
  res.render("signin.ejs");
});

// "/login" 이동
router.get("/login", (req, res) => {
  res.render("login.ejs");
});

module.exports = router;
