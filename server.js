//기본 세팅(expres 라이브러리) - 시작
const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
//미들웨어
app.use("/public", express.static("public"));
app.use(methodOverride("_method"));
// db 선언
let db;

MongoClient.connect(
  "mongodb+srv://admin:qwer1234@cluster0.gq7c239.mongodb.net/?retryWrites=true&w=majority",
  function (err, client) {
    if (err) return console.log(err);

    // db 연결
    db = client.db("hm-project");

    app.listen(8080, function () {
      console.log("8080포트가 열렸습니다.");
    });
  }
);
//기본 세팅(expres 라이브러리, body-parser, Mongodb) - 끝

// "/pet" 출력
app.get("/pet", (req, res) => {
  res.send("펫 용품 쇼핑할 수 있는 페이지");
});

// "/beauty" 출력
app.get("/beauty", (req, res) => {
  res.send("뷰티용품 쇼핑할 수 있는 페이지");
});

// "/" 출력
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// "/write" 출력
app.get("/write", (req, res) => {
  res.render("write.ejs");
});

// "/add" 경로로 POST 요청 시, db 중 couter라는 파일을 찾아서,거기 저장된 총 게시물 수 가져오기
// 그 게시물 갯수 이용해서 id를 만들어서 거기에 저장하시오.
app.post("/add", (req, res) => {
  res.send("전송 완료");
  db.collection("counter").findOne({ name: "numberOfPost" }, (err, result) => {
    console.log(result.totalPost);
    let numberOfPost = result.totalPost;
    db.collection("post").insertOne(
      { _id: numberOfPost + 1, title: req.body.title, date: req.body.date },
      function (err, result) {
        console.log("저장완료");
        // "counter" collection의 totalPost 항목 1 증가시키기(수정)
        db.collection("counter").updateOne(
          { name: "numberOfPost" },
          { $inc: { totalPost: 1 } },
          function (err, result) {
            if (err) {
              return console.log(err);
            }
          }
        );
      }
    );
  });
});

// "/list" 출력
app.get("/list", (req, res) => {
  //db에 저장된 post라는 collection 안의 제목이 @인 데이터 꺼내기
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      console.log(result);
      res.render("list.ejs", { posts: result });
    });
});

// "/delete" 경로로 DELETE 요청 처리
app.delete("/delete", (req, res) => {
  console.log(req.body);

  // 문자로 출력되는  "_id"를 정수로 변환 후, 할당
  req.body._id = parseInt(req.body._id);

  // req.body에 담겨온 게시물 번호를 가진 글을 db에서 찾아 삭제
  db.collection("post").deleteOne(req.body, function (err, result) {
    console.log("삭제완료");
    res.status(200).send({ message: "성공했습니다" });
  });
});

// "/detail"로 접속하면 detail.ejs 접속
app.get("/detail/:id", function (req, res) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      console.log(result);
      res.render("detail.ejs", { data: result });
    }
  );
});

// edit 페이지 보여주기
app.get("/edit/:id", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    (err, result) => {
      console.log(result);
      res.render("edit.ejs", { post: result });
    }
  );
});
