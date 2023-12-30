var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");

const { connectDabase } = require("./database/index");
const mountApi = require("./routes/index");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.all("*", function (req, res, next) {
  if (!req.get("Origin")) return next();
  res.header("Access-Control-Allow-Origin", req.headers.origin); //允许跨域的域名
  res.header("Access-Control-Allow-Credentials", "true"); //允许携带cookie，设置这个的话上一条的设置不能为'*'
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS"); //允许跨域的请求方法
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type"); //允许的请求头部
  if ("OPTIONS" === req.method) return res.sendStatus(200);
  next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((_, res, next) => {
  res.setHeader("Content-Type", "multipart/form-data");
  next();
});

// 设置session
app.use(
  session({
    secret: "secret",
    name: "seesion_id",
    cookie: {
      maxAge: 5000000,
      secure: false,
      httpOnly: false,
      sameSite: "strict",
      signed: true,
    },
    resave: false,
    saveUninitialized: true,
    rolling: true,
  })
);

// 连接数据库
connectDabase();

// 挂载路由
mountApi(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
