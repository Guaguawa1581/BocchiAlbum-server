const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const localDb = require("./middleware/localDb");

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
app.use("/api/testDb", (req, res) => {
  localDb.executeSQL((e) => {

    res.json(e);
  });
  // localDb.executeSQL("INSERT INTO users (user_id, email, password, username, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?)", ['398439', 'lskjdlfk@gjlak.com', 'eeee', 'elkejel', 'lskdjfl', 231123], (e) => {
  //   res.json(e);
  // });


});
app.use("/api/deleteTestDb", (req, res) => {
  localDb.closeDatabase();
});
// 開始監聽
// app.listen(8080, () => {
//   console.log(`Server running on port 8080`);
// });

// DB啟動後開始監聽
localDb.initDatabase((err) => {
  if (err) {
    console.error('Failed to initialize database:', err);
    return;
  }
  app.listen(8080, () => {
    console.log(`Server running on port 8080`);
  });
});