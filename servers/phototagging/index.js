const express = require("express");
const morgan = require("morgan");
var mongoose = require("mongoose");
var modules = require("./modules.js");
var photosRouter = require("./photosRouter.js");
var tagsRouter = require("./tagsRouter.js");
// var amqp = require('amqplib/callback_api'); // RabbitMQ


const app = express();

const addr = process.env.ADDR || "phototaggingcontainer:80";
// const addr = "localhost:4000"
const [host, port] = addr.split(":");

app.use(express.json());
app.use(morgan("dev"));

var mongoURL = process.env.MONGO_URL || 'mongodb://mongocontainer:27017/mongoDB';
// var mongoURL = 'mongodb://localhost:27017/mongoDB'; // not working

mongoose.connect(mongoURL, function (err, db) {
    if (err) {
        console.log ('ERROR connecting to: ' + mongoURL + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + mongoURL);     
    }
}).catch(error => {console.log('Error connecting to db: ', error.message); });

// TODO: WEBSOCKETS
/*
var rabbitURL = 'amqp://rabbitcontainer:5672'
amqp.connect(rabbitURL, function(err, conn) {
    if (err) {
		console.log("Failed to connect to Rabbit Instance from Messages microservice - INDEX.JS");
        console.log(err);
        process.exit(1);
    }
    
    console.log("Creating channel in Messaging microservice - INDEX.JS...")
    conn.createChannel(function(err, ch) {
        if (err) {
            console.log("Failed to create channel from Messages microservice - INDEX.JS");
            console.log(err);
			process.exit(1);
        }
        
        var q = 'messageq';

        console.log("Creating messageq - INDEX.JS")
        ch.assertQueue(q, {durable: false});
    });
});
*/

app.use("/", function(req, res, next) {
    // console.log("X-User in INDEX.JS: " + req.get("X-User"));
    // if (!req.get("X-User")) {
    //     res.status(401).send("User is not authenticated");
    // } else {
        next();
    // }
});



app.use("/photos", photosRouter);
app.use("/tags", tagsRouter);


app.use(function(err, req, res, next) {
    console.log(err);
    res.status(422).send({error: err.message});
})

app.listen(port, host, () => {
    console.log(`server is listening at http://${addr}...`);
});
