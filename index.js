const express = require("express"); // express 임포트
const app = express(); // app생성
const port = 5000;
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const { User } = require("./Models/user");
const config = require("./config/key");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.post("/login", (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾는다
  //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인
  //비밀번호 까지 맞다면 토큰을 생성하기
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다",
      });
    }

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다",
        });
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

app.get("/auth", auth, (req, res) => {
  //여기까지 미들웨어를 통과해 왔다는 얘기는 인증이 true라는 말이다
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
  });
});

app.get("/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
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
