const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const localDb = require("./middleware/localDb");
const defaultPort = process.env.PORT || 8080;
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

app.use("/api/testDb", async (req, res) => {
  try {
    const result = await localDb.selectSql();
    res.json(result);
  } catch (err) {
    res.json(err);
  }
});
app.use("/api/testDb2", async (req, res) => {
  try {
    const result = await localDb.selectSqlUser();
    res.json(result);
  } catch (err) {
    res.json(err);
  }
});
app.use("/api/testExecute", async (req, res) => {
  try {
    const result = await localDb.executeSql();
    res.json(result);
  } catch (err) {
    res.json(err);
  }
});
app.use("/api/testDeleteUser", async (req, res) => {
  try {
    const result = await localDb.deleteSql();
    res.json(result);
  } catch (err) {
    res.json(err);
  }
});

app.use("/api/testClose", async (req, res) => {
  try {
    const result = await localDb.closeDatabase();
    res.json(result);
  } catch (err) {
    res.json(err);
  }
});
// 開始監聽
// app.listen(8080, () => {
//   console.log(`Server running on port 8080`);
// });

// DB啟動後開始監聽
localDb.initDatabase((err) => {
  if (err) {
    console.error("Failed to initialize database:", err);
    return;
  }
  app.listen(defaultPort, () => {
    console.log(`Server running on port ${defaultPort}`);
  });
});
