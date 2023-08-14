let router = require("express").Router();

//로그인 검증
function loginVerification(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("로그인 상태가 아닙니다.");
  }
}

//아래의 모든 URL에 적용할 미들웨어
//이 코드를 이용하면, shop.js에 존재하는 모든 URL에 로그인 검증 진행
router.use(loginVerification);

// //아래 코드는, "/shirts"에 접속할 때만 로그인 검증 진행
// router.use("/shirts", loginVerification);

// 예제
router.get("/shirts", (req, res) => {
  res.send("셔츠 파는 페이지입니다.");
});

router.get("/pants", (req, res) => {
  res.send("바지 파는 페이지입니다.");
});

module.exports = router;
