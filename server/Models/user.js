const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // bcrypt 임포트
const jwt = require("jsonwebtoken");

const saltRounds = 10; // salt값을 10으로 정해주었다.

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxLength: 50,
  },
  email: {
    type: String,
    maxLength: 50,
    trim: true, // space를 없애준다.
    // unique: 1, // 같은값은 하나만 존재할 수 있다.
  },
  password: {
    type: String,
    maxLength: 100,
  },
  role: {
    type: Number,
    default: 0, // 값이 정해지지 않았다면 디폴트로 0!
  },
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  // userSchema가 save 되기 전에(pre) 실행할 함수function은~

  let user = this; //  this는 userSchema를 가르킨다.

  if (user.isModified("password")) {
    // password가 수정될때만 아래 코드 실행!
    bcrypt.genSalt(saltRounds, function (err, salt) {
      //  saltRounds가 10인 salt를 generate 해주자.
      if (err) return next(err); // 에러처리

      bcrypt.hash(user.password, salt, function (err, hash) {
        // user.password를 salt로 변경해서 hash로 return하는 함수~
        if (err) return next(err); // 에러처리
        user.password = hash; // user.password 자리에 hash를 할당!
        next(); // pre에서 나가 다음 코드 실행!
      });
    });
  } else {
    next(); // password 변경이 아닌 경우 바로 save코드 실행
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  let user = this;
  let token = jwt.sign(user._id.toHexString(), "secretToken");
  user.token = token;
  user.save((err, user) => {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  let user = this;

  jwt.verify(token, "secretToken", (err, decoded) => {
    //유저 아이디를 이용해서 유저를 찾은 다음에
    //클라이언트에서 가져온 token과 db에 보관된 토큰이 일치하는지 확인

    user.findOne({ _id: decoded, token: token }, (err, user) => {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};
const User = mongoose.model("User", userSchema); // userSchema를 model로 만들어준다.

module.exports = { User };
