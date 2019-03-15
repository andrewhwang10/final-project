var Photo = require("./photo.js");
// var Tag = require("./tag.js");
var multiparty = require('multiparty');
const fs = require('fs');
var path = require('path');
var async = require('async');
// var util = require('util');


function getUser(req) {
    let user = req.get("X-User");
    return user;
}

/*
// EC2's / --> container's /?
// How to mount volume?
// If want to use /path instead, don't need to create folder in EC2 first
    docker run -d \
    -v /:/ \
    --name phototaggingcontainer \
    knasu13/phototagging
    
// How to save file to mounted volume; just save to the mounted filepath in container? (SECOND in -v /:/)
// Considering fs.rename being asynchronous, is there a better place to put Photo saving?

*/
function photos(req, res, next) {
    // Will add user later
    let xUser = getUser(req);
    // let xUserID = JSON.parse(xUser).id

    switch (req.method) {
        case "GET":
            Photo.find({}, function(err, photos) {
                res.status(200).json(photos);
            }).catch(next);
            // Photo.find({ $or: [{privateChannel: false}, {privateChannel: true, members: xUserID}] }, function (err, channels) {
            //     res.json(channels);
            // }).catch(next);
            break;
        case "POST":
            var form = new multiparty.Form();
    
            /* TODO:
                - Create new random filename (done automatically?)
                - Save URL to volume
                - Create Photo object with new URL
                - Save Photo object to mongodb
            */

            form.parse(req, function(err, fields, files) {
                if (err) {
                    console.log("ERROR IN FORM.PARSE")
                    return;
                }
                console.log(fields.type)
                console.log(files.uploadFile + "length: " + files.uploadFile.length)
                console.log(xUser)

                formFields = fields
                formFiles = files.uploadFile

                console.log("formFiles INSIDE FORM.PARSE!!!: " + formFiles)

                var photoObjects = []

                // Handle multiple files in upload
                for (i = 0; i < formFiles.length; i++) {
                    console.log("FILE " + i + "!")
                    
                    defaultPath = formFiles[i].path
                    defaultPhotoName = path.basename(defaultPath)
                    // console.log("defaultPath: " + defaultPath)
    
                    // lastIndex = defaultPath.indexOf(defaultFileName)
                    // pathNoBase = defaultPath.substr(0, lastIndex)
                    // console.log("pathNoBase: " + pathNoBase)
    
                    originalPhotoName = formFiles[i].originalFilename
    
                    // newPath = pathNoBase + photoName
                    // newPath = process.env.PWD.substr(2) + "/" + photoName // TESTING that file is saving
                    // newPath = process.env.PWD.substr(2) + "/" + defaultPhotoName // TESTING that file is saving
                    newPath = "/" + defaultPhotoName
                    console.log("newPath (SHOULD BE NEW NAME): " + defaultPhotoName)
    
                    // /*
                    var newPhoto = new Photo();
                    newPhoto.url = newPath;
                    newPhoto.originalPhotoName = originalPhotoName
                    newPhoto.creator = xUser;  
                    newPhoto.createdAt = Date.now();
                    newPhoto.editedAt = Date.now();

                    photoObjects.push(newPhoto)

                    fs.rename(defaultPath, newPhoto.url, (err) => {
                        if (err) throw err;
                        console.log("FILE RENAMED: " + newPhoto.url)
                        // fs.stat(newPath, (err, stats) => {
                        //   if (err) throw err;
                        //   console.log(`stats: ${JSON.stringify(stats)}`);
                        // });
                    });
                }

                console.log("photoObjects: " + photoObjects)

                async.forEachOf(photoObjects, function(photoObj, index, callback) {
                    console.log("IN ASYNC")
                    Photo.findOne({originalPhotoName: photoObj.originalPhotoName}).then(function(photo) {
                        if (!photo) {
                            photoObj.save().then(function(savedPhoto) {
                                console.log("Saved photo: " + savedPhoto)
                                // channelToSend = createChannelEvent(CHANNEL_NEW, channel, false);
                                // sendToQueue(channelToSend);

                                // fs used to be here

                                // res.status(201).json(savedPhoto);
                            })
                        } else {
                            console.log("Photo named " + photoObj.originalPhotoName + " already exists")
                        }
                    }).catch(next);
                }, function (err) {
                    if (err) {
                        console.log("ERR IN ASYNC: " + err.message);
                    } 
                });
    
                    // Photo.find({originalPhotoName: newPhoto.originalPhotoName}, function(err, photo) {
                    //     if (photo.length == 0) {
                    //         newPhoto.save().then(function(savedPhoto) {
                    //             // channelToSend = createChannelEvent(CHANNEL_NEW, channel, false);
                    //             // sendToQueue(channelToSend);
                    //             fs.rename(defaultPath, newPath, (err) => {
                    //                 if (err) throw err;
                    //                 console.log("FILE RENAMED: " + newPath)
                    //                 // fs.stat(newPath, (err, stats) => {
                    //                 //   if (err) throw err;
                    //                 //   console.log(`stats: ${JSON.stringify(stats)}`);
                    //                 // });
                    //             });
                    //             // res.status(201).json(savedPhoto);
                    //         })
                    //     } else {
                    //         console.log("Photo named " + newPhoto.originalPhotoName + " already exists")
                    //     }
                    // }).catch(next);
                    // */
    
                    /*
                    fs.rename(defaultPath, newPath, (err) => {
                        if (err) throw err;
                        console.log("FILE RENAMED: " + newPath)
                        // fs.stat(newPath, (err, stats) => {
                        //   if (err) throw err;
                        //   console.log(`stats: ${JSON.stringify(stats)}`);
                        // });
                    });
                    */
                res.send(formFiles)
            });
            // res.send(util.inspect({fields: fields, files: files}));
            break;
        default:
            res.send("Method is not allowed");
    }
}


/*
function specificPhoto(req, res, next) {
    let xUser = getUser(req);
    let photoID = req.params.photoID;
    // let xUserID = JSON.parse(xUser).id

    switch (req.method) {
        
        case "GET":
            Photo.findOne({_id: photoID}).then(function(photo) {
                if (!photo) {
                    res.send("Channel doesn't exist!");
                } else {
                    // Check if user is shared on the tag via for loop
                    // for each tag in photo.tagIDs...
                    // if (!tag.members.includes(xUserID)) {
                    //     res.status(403).send("You are not a registered viewer of any tags on this photo.");
                    // } else {
                        Photo.find({photoID: photoID}).then(function(photos) {
                            let startingIndex = 0;
                            let response = messages.slice(startingIndex, startingIndex + 100);
                            if (req.query.before) {
                                let beforeMessageID = parseInt(req.query.before, 10)
            
                                let beforeMessage = messages.find(function(element) {
                                    return element._id == beforeMessageID;
                                });
            
                                if (beforeMessage) {
                                    startingIndex = messages.indexOf(beforeMessage) + 1;
                                    res.set("Content-Type", "application/json")
                                    response = messages.slice(startingIndex, startingIndex + 100);
                                } else {
                                    response = "Message to search from doesn't exist"
                                }
                            }
                            res.send(response);
                        }).catch(next);
                    }
                }
            });
            break;
        case "POST":
            Channel.findOne({_id: channelID}).then(function(channel) {
                if (!channel) {
                    res.send("Channel doesn't exist!");
                } else {
                    if (channel.privateChannel && !channel.members.includes(xUserID)) {
                        res.status(403).send("You are not a member of this private channel.");
                    } else {
                        var newMessage = new Message(req.body);
                        newMessage.channelID = channelID;
                        newMessage.creator = xUser;            
                        newMessage.createdAt = Date.now();
                        newMessage.editedAt = Date.now();

                        newMessage.save().then(function(message) {
                            console.log("/////////////////////////////")
                            console.log("Saving message in mongodb and sending to RabbitMQ queue")

                            eventToSend = createMessageEvent(MESSAGE_NEW, message, channel, false);
                            sendToQueue(eventToSend);
                            
                            console.log("/////////////////////////////")
                            res.status(201).json(message)
                        }).catch(next);
                    }
                }
            });
            break;
        case "PATCH":
            Channel.findOne({_id: channelID}).then(function(channel) {
                if (!channel) {
                    res.send("Channel doesn't exist!");
                } else {
                    if (channel.creator != xUser) {
                        res.status(403).send("You are not the creator of this channel.");
                    } else {
                        Channel.findOneAndUpdate({_id: channelID}, {editedAt: Date.now(), name: req.body.name, description: req.body.description}, {new: true}, (err, channel) => {
                            if (err) {
                                res.send("Error: Couldn't update channel: " + err);
                            } else {
                                channelToSend = createChannelEvent(CHANNEL_UPDATE, channel, false);
                                sendToQueue(channelToSend);
                                res.json(channel);
                            }
                        });
                    }
                }
            }).catch(next);
            break;
        
        case "DELETE":
            Photo.findOne({name: "general"}).then(function(photo) {
                Photo.findOne({_id: photoID}).then(function(photo) {
                    if (!photo) {
                        res.send("Photo doesn't exist!");
                    } else {
                        // if (photo.creator != xUser) {
                        //     res.status(403).send("You are not the creator of this channel.");
                        // } else {
                            Photo.deleteOne({_id: phooID}, function(err) {
                                if (err) {
                                    res.send("Error: Could not delete channel: " + err)
                                }
                                // eventToSend = createChannelEvent(CHANNEL_DELETE, channel, true)
                                // sendToQueue(eventToSend);
                            }).catch(next);

                            // Message.deleteMany({channelID: channelID}, function(err, messages) {
                            //     if (err) {
                            //         res.send("Error: Couldn't delete messages: " + err)
                            //     } else {
                            //         console.log(messages)
                            //         if (messages.deletedCount == 0) {
                            //             res.send("Channel has been removed");
                            //         } else {
                            //             res.send("Channel and messages have been removed");
                            //         }
                            //     }
                            // }).catch(next);
                    }
                });
            }).catch(next);
            break;
        default:
            res.send("Method not allowed")
    }
}

// function tagOnPhoto(req, res, next) {

// }
*/
exports.photos = photos