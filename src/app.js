const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");
const morgan = require("morgan");

const log = require("./queries/logQuery");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const usersRoutes = require("./routes/usersRoutes");
const accountRoutes = require("./routes/accountRoutes");
const barangRoutes = require("./routes/barangRoutes");
const barangMasukRoutes = require("./routes/barangMasukRoutes");
const barangKeluarRoutes = require("./routes/barangKeluarRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(
  cookieSession({
    name: "session",
    keys: [uuidv4()],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));
app.use("/assets", express.static(path.join(__dirname, "../public/assets")));
app.use("/css", express.static(path.join(__dirname, "../public/css")));
app.use("/js", express.static(path.join(__dirname, "../public/js")));
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/plugins", express.static(path.join(__dirname, "../public/plugins")));
app.use("/dist", express.static(path.join(__dirname, "../public/dist")));
app.use("/node_modules", express.static(path.join(__dirname, "../node_modules")));

const custom = (tokens, req, res) => {
  if (req.session) {
    if (req.session.user) {
      const usr = req.session.user.email;
      const method = tokens.method(req, res);
      const endpoint = tokens.url(req, res);
      const statusCode = tokens.status(req, res);

      log.addLog(usr, method, endpoint, statusCode);
    }
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  }
};

app.use(morgan(custom));

app.use(authRoutes);
app.use(dashboardRoutes);
app.use(usersRoutes);
app.use(accountRoutes);
app.use(barangRoutes);
app.use(barangMasukRoutes);
app.use(barangKeluarRoutes);
app.use(logRoutes);

app.get("*", function (req, res) {
  res.status(404).render("404", { title: "404 Error" });
});

module.exports = app;