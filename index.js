const express = require("express"); // express 임포트
const app = express(); // app생성
const port = 5000;

const { User } = require("./Models/user");
const config = require("./config/key");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.send("hello world!1!");
});

app.post("/register", (req, res) => {
  const user = new User(req.body); // 상단에서 require로 가져온 User 스키마에 req.body를 담아 user라는 인스턴스로 만든다.

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err }); // err일 경우 return 값
    return res.status(200).json({
      //status가 200일 경우 return 값
      success: true,
      userInfo,
    });
  });
});

app.listen(port, () => console.log(`${port}포트입니다.`));

// 몽구스 연결
const mongoose = require("mongoose");
const { urlencoded } = require("express");
mongoose
  .connect(config.mongoURI, {
    // useNewUrlPaser: true,
    // useUnifiedTofology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log("MongoDB conected"))
  .catch((err) => {
    console.log(err);
  });
