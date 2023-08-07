//기본 세팅(expres 라이브러리) - 시작
const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
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
  res.sendFile(__dirname + "/index.html");
});

// "/write" 출력
app.get("/write", (req, res) => {
  res.sendFile(__dirname + "/write.html");
});

// "/add" 경로로 POST 요청 시,
app.post("/add", (req, res) => {
  res.send("전송 완료");
  console.log(req.body.title);
  console.log(req.body.date);
  // 여기서 저장된 데이터는 req애 저장되어 있음
  // req에 저장된 데이터 꺼내 쓰려면 body-parser 라이브러리 설치 필요
  db.collection("post").insertOne(
    { title: req.body.title, date: req.body.date },
    function (err, result) {
      console.log("저장완료");
    }
  );
});

// "/list" 출력
app.get("/list", (req, res) => {
  res.render("list.ejs");
});
