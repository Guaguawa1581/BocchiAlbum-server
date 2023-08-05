const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

// import route
const userRouter = require("./routes/userRouter");
const imageRouter = require("./routes/imageRouter");
const cardRouter = require("./routes/cardRouter");

// middleware
app.use(cors()); //跨域設定
app.use(express.json()); //解析POST請求的JSON主機
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// routes
app.use("/api/user", userRouter);
app.use("/api/image", imageRouter);
app.use("/api/card", cardRouter);
app.use("/api/test", (req, res) => {
  const token = req.header("Authorization");
  console.log(token);
  return res.json({
    meg: "test test",
    token: token
  });
});

// 開始監聽
app.listen(8080, () => {
  console.log(`Server running on port 8080`);
});
