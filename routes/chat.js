let router = require("express").Router();

router.get("/socket", (req, res) => {
  res.render("socket.ejs");
});

module.exports = router;
