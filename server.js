//기본 세팅(expres 라이브러리) - 시작
const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");

require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use("/public", express.static("public"));
app.use(methodOverride("_method"));

//.env - 시작
//db 선언
let db;

MongoClient.connect(process.env.DB_URL, function (err, client) {
  if (err) return console.log(err);
  // db 연결
  db = client.db("hm-project");
  app.listen(process.env.PORT, function () {
    console.log("8080 포트가 열렸습니다.");
  });
});
//.env - 끝

//기본 세팅(expres 라이브러리, body-parser, Mongodb, methodOverride, dotenv) - 끝

// "/" 출력
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// "/write" 출력
app.get("/write", (req, res) => {
  res.render("write.ejs");
});

//"/list" 검색 기능
app.get("/search", (req, res) => {
  let SearchConditions = [
    {
      $search: {
        index: "titleSearch",
        text: {
          query: req.query.value,
          path: "title",
        },
      },
    },
    // _id 오름차순으로 정렬 (-1 입력 -> 내림차순 정렬)
    { $sort: { _id: 1 } },
    // // 게시물 2개까지만 가져오기 (_id 순서대로)
    // { $limit: 2 },
  ];

  db.collection("post")
    .aggregate(SearchConditions)
    .toArray((err, result) => {
      console.log(result);
      res.render("search.ejs", { posts: result });
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

//서버로 PUT 요청 들어오면 게시글 수정 처리
app.put("/edit", (req, res) => {
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { title: req.body.title, date: req.body.date } },
    (err, result) => {
      console.log("수정 완료");
      res.redirect("/list");
    }
  );
});

//Session 방식 로그인 기능 세팅
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

app.use(
  session({ secret: "비밀코드", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

// "/login.ejs" 이동
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

//아이디 비번 검증
//login 시, index로 리다이렉트
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

// 마이페이지
app.get("/mypage", loginVerification, (req, res) => {
  console.log(req.user);
  res.render("mypage.ejs", { user: req.user });
});

function loginVerification(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("로그인 상태가 아닙니다.");
  }
}

// 검증 코드
passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    function (writtenId, writtenPw, done) {
      console.log(writtenId, writtenPw);
      db.collection("login").findOne({ id: writtenId }, function (err, result) {
        if (err) return done(err);

        if (!result)
          return done(null, false, { message: "존재하지 않는 아이디 입니다." });
        if (writtenPw == result.pw) {
          return done(null, result);
        } else {
          return done(null, false, {
            message: "비밀번호가 일치하지 않습니다.",
          });
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  db.collection("login").findOne({ id: id }, function (err, result) {
    done(null, result);
  });
});

//회원 가입 기능
// "/signin" 이동
app.get("/signin", (req, res) => {
  res.render("signin.ejs");
});
// db.collection("login")에 입력된 회원 정보 저장
app.post("/signin", (req, res) => {
  let userName = req.body.name;
  let userNumber = req.body.number;
  let userId = req.body.id;
  let userPw = req.body.pw;

  db.collection("login").insertOne(
    {
      name: userName,
      phone: userNumber,
      id: userId,
      pw: userPw,
    },
    (err, result) => {
      res.redirect("/login");
      console.log("회원가입 완료");
    }
  );
});

// "/add" 경로로 POST 요청 시, db 중 counter라는 파일을 찾아서, 거기 저장된 총 게시물 수 가져오기
// 그 게시물 갯수 이용해서 id를 만들어서 거기에 저장하시오.
app.post("/add", (req, res) => {
  res.send("전송 완료");
  db.collection("counter").findOne({ name: "numberOfPost" }, (err, result) => {
    console.log(result.totalPost);
    let numberOfPost = result.totalPost;

    // posting 기능
    let postInput = {
      _id: numberOfPost + 1,
      writer: req.user._id,
      title: req.body.title,
      date: req.body.date,
    };

    db.collection("post").insertOne(postInput, function (err, result) {
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
    });
  });
});

// 채팅 기능
app.post("/chatroom", loginVerification, (req, res) => {
  let chatInput = {
    title: req.body.chatReceive + "와" + req.user._id + "의 채팅방",
    member: [ObjectId(req.body.chatReceive), req.user._id],
    date: new Date(),
  };

  db.collection("chatroom")
    .insertOne(chatInput)
    .then((result) => {
      res.send("전송 완료");
    });
});

// "/chat.ejs" 접속
app.get("/chat", loginVerification, (req, res) => {
  db.collection("chatroom")
    .find({ member: req.user._id })
    .toArray()
    .then(() => {
      res.render("chat.ejs", { data: result });
    });
});

// "/delete" 경로로 DELETE 요청 처리
app.delete("/delete", (req, res) => {
  console.log(req.body);

  // 문자로 출력되는  "_id"를 정수로 변환 후, 할당
  req.body._id = parseInt(req.body._id);

  let deleteData = { _id: req.body._id, writer: req.user._id };

  // req.body에 담겨온 게시물 번호를 가진 글을 db에서 찾아 삭제
  db.collection("post").deleteOne(deleteData, function (err, result) {
    console.log("삭제완료");
    if (result) {
      console.log(result);
    }
    res.status(200).send({ message: "성공했습니다" });
  });
});

//이미지 업로드 - multer 라이브러리 사용법 시작
let multer = require("multer");
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/image");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
  filefilter: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(new Error("PNG, JPG만 업로드하세요"));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024,
  },
});

let upload = multer({ storage: storage });
//이미지 업로드 - multer 라이브러리 사용법 끝

// 특정 페이지 방문 시, "/upload.ejs" 보여줌
app.get("/upload", (req, res) => {
  res.render("upload.ejs");
});
// 업로드한 이미지 "/public/image"에 저장
app.post("/upload", upload.single("profile"), (req, res) => {
  res.send("업로드 완료");
});

//업로드된 이미지 출력
app.get("/image/:imageName", function (req, res) {
  res.sendFile(__dirname + "/public/image/" + req.params.imageName);
});

//예제
app.use("/shop", require("./routes/shop.js"));

//문제
app.use("/board/sub", require("./routes/board.js"));
