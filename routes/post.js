let router = require("express").Router();

// "/write" 페이지 이동
router.get("/write", (req, res) => {
  res.render("write.ejs");
});

module.exports = router;
