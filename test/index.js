const express = require("express");
const gulog = require("gulog-node");

gulog.init({
    token: "6DL6_9FqS9g6i866rz",
    version: "1.0.0",
    // endpoint: "http://localhost:3000",
});

const app = express();

app.use((req, res, next) => {
    gulog.withProcess("request", { method: req.method }, next);
});

app.get("/", (req, res, next) => {
    gulog.log("sending home");

    res.end("this is the home page!");

    gulog.end("ok");
});

app.get("/secret", (req, res, next) => {
    gulog.warn("user visits secret page", req.socket.remoteAddress);

    res.end("you can't be here!!!");

    gulog.end("ok");
});

app.use((err, req, res, next) => {
    gulog.error(String(err));
    gulog.end("error");
});

app.use((req, res, next) => {
    gulog.error(`could not find ${req.method} ${req.path}`);
    gulog.end("error-404");
    res.end("not found");
});

app.listen(5000);
