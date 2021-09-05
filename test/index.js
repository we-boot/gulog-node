const express = require("express");
const Gulog = require("gulog-node");

Gulog.init({
    token: "pm6t6du6pCKgefUYdM",
    version: "1.0.0",
    endpoint: "http://localhost:3000",
});

const app = express();

app.use((req, res, next) => {
    Gulog.withGulog("request", { method: req.method }, next);
});

app.get("/", (req, res, next) => {
    Gulog.log("sending home");

    res.end("this is the home page!");

    Gulog.end("ok");
});

app.get("/secret", (req, res, next) => {
    Gulog.warn("user visits secret page", req.socket.remoteAddress);

    res.end("you can't be here!!!");

    Gulog.end("ok");
});

app.listen(5000);
