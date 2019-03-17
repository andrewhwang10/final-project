var Photo = require("./photo.js");
var Tag = require("./tag.js");
var multiparty = require('multiparty');
const fs = require('fs');
var path = require('path');
var async = require('async');


function getUser(req) {
    let user = req.get("X-User");
    return user;
}

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
                - Save file to VOLUME
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
                var defaultPaths = []

                // Handle multiple files in upload
                for (i = 0; i < formFiles.length; i++) {
                    console.log("FILE " + i + "!")
                    
                    file = formFiles[i]
                    defaultPath = file.path
                    defaultPaths.push(defaultPath)
                    defaultPhotoName = path.basename(defaultPath)
                    // console.log("defaultPath: " + defaultPath)
    
                    // lastIndex = defaultPath.indexOf(defaultFileName)
                    // pathNoBase = defaultPath.substr(0, lastIndex)
                    // console.log("pathNoBase: " + pathNoBase)
    
                    originalPhotoName = file.originalFilename
    
                    // newPath = pathNoBase + photoName
                    // newPath = process.env.PWD.substr(2) + "/" + photoName // TESTING that file is saving
                    // newPath = process.env.PWD.substr(2) + "/" + defaultPhotoName // TESTING that file is saving
                    newPath = "/photos/" + defaultPhotoName
                    console.log("newPath (SHOULD BE NEW NAME): " + defaultPhotoName)

                    var newPhoto = new Photo();
                    newPhoto.url = newPath;
                    newPhoto.originalPhotoName = originalPhotoName
                    newPhoto.creator = xUser;
                    newPhoto.createdAt = Date.now();
                    newPhoto.editedAt = Date.now();

                    // photoObjects.push(newPhoto)

                    // fs.copyFile(defaultPath, newPhoto.url, (err) => {
                    //     if (err) throw err;
                    //     // fs.unlinkSync(defaultPath)
                    // });
                }

                // TEST THIS. SSH failed before testing
                // Files or directory weren't being found
                for (i = 0; i < photoObjects.length; i++) {
                    fs.copyFile(defaultPaths[i], photoObjects[i].url, (err) => {
                        if (err) throw err;
                        // fs.unlinkSync(defaultPath)
                    });
                }

                console.log("photoObjects: " + photoObjects)

                async.forEachOf(photoObjects, function(photoObj, index, callback) {
                    console.log("IN ASYNC")
                    Photo.findOne({originalPhotoName: photoObj.originalPhotoName}).then(function(photo) {
                        if (!photo) {
                            photoObj.save().then(function(savedPhoto) {
                                photoObjects.push(savedPhoto)
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
                res.json(photoObjects)
            });
            break;
        default:
            res.send("Method is not allowed");
    }
}


function specificPhoto(req, res, next) {
    let xUser = getUser(req);
    let photoID = req.params.photoID;
    let tagID = req.params.tagID;
    // let xUserID = JSON.parse(xUser).id

    switch (req.method) {
        case "GET":
            Photo.findOne({_id: photoID}).then(function(photo) {
                if (!photo) {
                    res.send("Photo doesn't exist!");
                } else {
                    // Check if user is shared on the tag via for loop
                    // for each tag in photo.tagIDs...
                    // if (!tag.members.includes(xUserID)) {
                    //     res.status(403).send("You are not a registered viewer of any tags on this photo.");
                    // } else {
                        photoURL = photo.url
                        readStream = fs.createReadStream(photoURL);
                        // We replaced all the event handlers with a simple call to readStream.pipe()
                        res.status(200)
                        readStream.pipe(res);
                    //}
                }
            });
            break;
        // Changed from POST to PATCH?
        case "PATCH":
            Photo.findOne({_id: photoID}).then(function(photo) {
                if (!photo) {
                    res.send("Photo doesn't exist!");
                } else {
                    // if (channel.privateChannel && !channel.members.includes(xUserID)) {
                    //     res.status(403).send("You are not a member of this private channel.");
                    // } else {
                        Tag.findOne({_id: tagID}).then(function(tag) {
                            // console.log("Add tag to photo: " + tag)
                            updatedTags = photo.tags.push(tag)

                            Photo.findOneAndUpdate({_id: photoID}, {editedAt: Date.now(), tags: updatedTags}, {new: true}, (err, updatedPhoto) => {
                                if (err) {
                                    res.send("Error: Couldn't update (add tag to) photo: " + err);
                                } else {
                                    // channelToSend = createChannelEvent(CHANNEL_UPDATE, channel, false);
                                    // sendToQueue(channelToSend);
                                    res.json(updatedPhoto);
                                }
                            });
            
                            // newMessage.save().then(function(message) {
                            //     console.log("/////////////////////////////")
                            //     console.log("Saving message in mongodb and sending to RabbitMQ queue")

                            //     eventToSend = createMessageEvent(MESSAGE_NEW, message, channel, false);
                            //     sendToQueue(eventToSend);
                                
                            //     console.log("/////////////////////////////")
                            //     res.status(201).json(message)
                            // });

                        }).catch(next);
                    // }
                }
            });
            break;
            
        case "DELETE":
            Photo.findOne({_id: photoID}).then(function(photo) {
                if (!photo) {
                    res.send("Photo doesn't exist!");
                } else {
                    // if (photo.creator != xUser) {
                    //     res.status(403).send("You are not the creator of this photo.");
                    // } else {
                    Photo.deleteOne({_id: photoID}, function(err) {
                        if (err) {
                            res.send("Error: Could not delete photo: " + err)
                        }
                        res.send("Deleted photo")
                        // eventToSend = createChannelEvent(CHANNEL_DELETE, channel, true)
                        // sendToQueue(eventToSend);
                    }).catch(next);
                }
            }).catch(next);
            break;
        default:
            res.send("Method not allowed")
    }
}

function tags(req, res, next) {
    switch (req.method) {
        case "GET":
            Tag.find({}, function(err, tags) {
                res.status(200).json(tags);
            }).catch(next);
            // Photo.find({ $or: [{privateChannel: false}, {privateChannel: true, members: xUserID}] }, function (err, channels) {
            //     res.json(channels);
            // }).catch(next);
            break;
        case "POST":
            var form = new multiparty.Form();

            form.parse(req, function(err, fields, files) {
                if (err) {
                    console.log("ERROR IN FORM.PARSE")
                    return;
                }

                console.log(fields)
                console.log(fields.name)
                console.log(fields.members)
                
                var newTag = new Tag();
                newTag.name = fields.name
                newTag.members = fields.members
                newTag.creator = xUser;
                newTag.createdAt = Date.now();
                newTag.editedAt = Date.now();

                newTag.save().then(function(savedTag) {
                    res.status(201).json(savedTag)
                }).catch(next);
            });
            break;
        default:
            res.send("Method not allowed")
    }
}

function specificTag(req, res, next) {
    tagID = req.params.tagID;

    switch (req.method) {
        case "GET":
            Tag.findOne({_id: tagID}).then(function(tag) {
                if (!tag) {
                    res.send("Tag doesn't exist!");
                } else {
                    // if (!tag.members.includes(xUserID)) {
                    //     res.status(403).send("You are not a registered viewer of any tags on this photo.");
                    // } else {
                        res.status(200).json(tag)
                    // }
                }
            });
            break;
        case "DELETE":
            Tag.findOne({_id: tagID}).then(function(tag) {
                if (!tag) {
                    res.send("Tag doesn't exist!");
                } else {
                    // Photo.find({tags: tagID}, function (err, photos) {
                        //{editedAt: Date.now(), tags: updatedTags}
                        // or tag._id
                        // {new: true},
                        // no need array filters?
                        Photo.updateMany({tags: tagID}, { $pull: {tags: tagID}})
                    //  }).catch(next);
                    /*
                    updatedTags = photo.tags.push(tag)

                    Photo.findOneAndUpdate({_id: photoID}, {editedAt: Date.now(), tags: updatedTags}, {new: true}, (err, updatedPhoto) => {
                        if (err) {
                            res.send("Error: Couldn't update (add tag to) photo: " + err);
                        } else {
                            // channelToSend = createChannelEvent(CHANNEL_UPDATE, channel, false); 
                            // sendToQueue(channelToSend);
                            res.json(updatedPhoto);
                        }
                    });
                    */

                    // check if user is creator
                    // if (!tag.members.includes(xUserID)) {
                    //     res.status(403).send("You are not a registered viewer of any tags on this photo.");
                    // } else {
                        res.status(200).send("Tag has been deleted")
                    // }
                }
            });
            break;
        default:
            res.send("Method not allowed")
    }
}


exports.photos = photos
exports.specificPhoto = specificPhoto
exports.tags = tags
exports.specificTag = specificTag