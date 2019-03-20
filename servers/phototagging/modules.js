var Photo = require("./photo.js");
var Tag = require("./tag.js");
var multiparty = require('multiparty');
const fs = require('fs');
var path = require('path');
var async = require('async');


function getUserID(req, res) {
    let user = req.get("X-User");
    let userID = String(JSON.parse(user).id)
    return userID;
}

function photos(req, res, next) {
    let xUserID = getUserID(req, res);

    console.log("X-UserID: " + xUserID)

    switch (req.method) {
        case "GET":
            console.log("INSIDE PHOTOS")
            Photo.find( { $or: [{'tags.members': xUserID }, {creator: xUserID}] }).then(function(photos) {
                photoResponses = []
                for (i = 0; i < photos.length; i++) {
                    photo = photos[i]
                    url = photo.url
                    tagNames = []
                    for (j = 0; j < photo.tags.length; j++) {
                        tagNames.push(photo.tags[j].name)
                    }
                    photoBytes = Buffer.from(fs.readFileSync(url)).toString("base64") // returns STRING representation of ARRAY?

                    photoRes = {
                        photoID: photo._id,
                        tags: tagNames,
                        likes: photo.likes,
                        data: photoBytes
                    }
                    photoResponses.push(photoRes)
                }
                console.log("photoResponses: " + photoResponses)
                res.status(200).send(photoResponses)

            }).catch(next);
            break;

        case "POST":
            var form = new multiparty.Form();
            var savedPhotos = []
            form.parse(req, function(err, fields, files) {
                if (err) {
                    console.log("ERROR IN FORM.PARSE: " + err)
                    res.status(415).send("Error in parsing form: " + err)
                    return;
                }

                if (!files.uploadFile) {
                    res.send("Upload a file!")
                    return
                }

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
    
                    originalPhotoName = file.originalFilename
    
                    newPath = "/photos/" + defaultPhotoName
                    console.log("newPath: " + newPath)

                    var newPhoto = new Photo();
                    newPhoto.url = newPath;
                    newPhoto.originalPhotoName = originalPhotoName
                    newPhoto.likes = []
                    newPhoto.creator = xUserID;
                    newPhoto.createdAt = Date.now();
                    newPhoto.editedAt = Date.now();
                    console.log(newPhoto)

                    photoObjects.push(newPhoto)
                }

                for (i = 0; i < photoObjects.length; i++) {
                    fs.copyFile(defaultPaths[i], photoObjects[i].url, (err) => {
                        if (err) throw err;
                    });
                }

                
                async.forEachOf(photoObjects, function(photoObj, index, callback) {
                    console.log("IN ASYNC")
                    console.log("originalPhotoName: " + photoObj.originalPhotoName)
                    console.log("xUserID: " + xUserID)
                    Photo.findOne({originalPhotoName: photoObj.originalPhotoName, creator: xUserID}).then(function(photo) {
                        if (!photo) {
                            photoObj.save().then(function(savedPhoto) {
                                console.log("Saved photo: " + savedPhoto)
                                savedPhotos.push(savedPhoto)
                                if (savedPhotos.length == photoObjects.length) {
                                    res.status(201).json(savedPhotos)
                                }
                            }).catch(next);
                        } else {
                            res.send("Photo named " + photoObj.originalPhotoName + " already exists")
                        }
                    }).catch(next);
                }, function (err) {
                    if (err) {
                        res.send("ERR IN ASYNC: " + err.message);
                    }
                });
            });
            break;
        default:
            res.send("Method is not allowed");
    }
}

// Check if user is creator of tag or member of it
function photosByTag(req, res, next) {
    let xUserID = getUserID(req, res);

    let tagID = req.params.tagID;

    switch (req.method) {
        case "GET":
            Tag.findOne({ _id: tagID }).then(function(tag) {
                if (!tag) {
                    res.send("Tag doesn't exist");
                    return
                }

                Photo.find( { $or: [{'tags.members': xUserID }, {creator: xUserID}], tags: tag }).then(function(photos) {
                    photoResponses = []
                    for (i = 0; i < photos.length; i++) {
                        photo = photos[i]
                        url = photo.url
                        tagNames = []
                        for (j = 0; j < photo.tags.length; j++) {
                            tagNames.push(photo.tags[j].name)
                        }
                        photoBytes = Buffer.from(fs.readFileSync(url)).toString("base64") // returns STRING representation of ARRAY?
    
                        photoRes = {
                            photoID: photo._id,
                            tags: tagNames,
                            likes: photo.likes,
                            data: photoBytes
                        }
                        photoResponses.push(photoRes)
                    }
                    console.log("photoResponses: " + photoResponses)
                    res.status(200).send(photoResponses)
    
                }).catch(next);
            }).catch(next);
            break;
        default:
            res.send("Method not allowed")
    }
}

// /photos/:photoID
// /photos/:photoID/:tagID
function specificPhoto(req, res, next) {
    let xUserID = getUserID(req, res);

    console.log("INSIDE SPECIFIC PHOTO")
    console.log("xUserID: " + xUserID)
    let photoID = req.params.photoID;
    let tagID = req.params.tagID;

    switch (req.method) {
        case "POST":
            Photo.findOne({_id: photoID}).then(function(photo) {
                if (!photo) {
                    res.send("Photo doesn't exist!");
                    return
                }
                if (!tagID) {
                    // CHECK IF PHOTO IS ACTUALLY SHARED WITH USER
                    photoLikes = photo.likes

                    if (photoLikes.includes(xUserID)) {
                        i = photoLikes.indexOf(xUserID)
                        photoLikes.splice(i, 1)
                    } else {
                        photoLikes.push(xUserID)
                    }
                    
                    Photo.findOneAndUpdate({_id: photoID}, {editedAt: Date.now(), likes: photoLikes}, {new: true}, (err, updatedPhoto) => {
                        if (err) {
                            res.send("Error: Couldn't update (like/unlike) photo: " + err);
                            return
                        } else {
                            res.json(updatedPhoto);
                        }
                    }).catch(next);
                } else {
                    console.log("CREATOR of photo: " + xUserID)
                    if (photo.creator != xUserID) {
                        res.status(403).send("You are not the creator of this photo.");
                        return
                    }

                    Tag.findOne({_id: tagID}).then(function(tag) {
                        if (tag.creator != xUserID) {
                            res.status(403).send("You are not the creator of this tag.");
                        } else {
                            tagOnPhoto = false
                            for (i = 0; i < photo.tags.length; i++) {
                                curTag = photo.tags[i]
                                if (curTag.name.toLowerCase() == tag.name.toLowerCase()) {
                                    tagOnPhoto = true
                                    res.send("Tag is already on the photo")
                                }
                            }
                            if (!tagOnPhoto) {
                                console.log("Adding tag to photo: " + tag)

                                photoTags = photo.tags
                                photoTags.push(tag)
                                console.log("photoTags: " + photoTags)
        
                                Photo.findOneAndUpdate({_id: photoID}, {editedAt: Date.now(), tags: photoTags}, {new: true}, (err, updatedPhoto) => {
                                    if (err) {
                                        res.send("Error: Couldn't update (add tag to) photo: " + err);
                                    } else {
                                        // channelToSend = createChannelEvent(CHANNEL_UPDATE, channel, false);
                                        // sendToQueue(channelToSend);
                                        res.status(200).json(updatedPhoto);
                                    }
                                }).catch(next);
                            }

                        }
                    }).catch(next);
                }
            }).catch(next);
            break;
            
        case "DELETE":
            Photo.findOne({_id: photoID}).then(function(photo) {
                if (!photo) {
                    res.send("Photo doesn't exist!");
                    return
                }
                if (photo.creator != xUserID) {
                    res.status(403).send("You are not the creator of this photo.");
                    return
                }
                if (!tagID) {
                    Photo.deleteOne({_id: photoID}, function(err) {
                        if (err) {
                            res.send("Error: Could not delete tag from photo: " + err)
                            return
                        }
                        res.status(200).send("Deleted photo")
                    }).catch(next);
                } else {
                    Photo.findOneAndUpdate({_id: photoID}, { $pull: {"tags": tagID}, editedAt: Date.now()}, {returnNewDocument: true}, (err, updatedPhoto) => {
                        if (err) {
                            res.send("Error: Couldn't remove tag from photo: " + err)
                            return
                        }
                        res.status(200).send(updatedPhoto)
                    }).catch(next);
                }
            }).catch(next);
            break;

        default:
            res.send("Method not allowed")
    }
}

// /tags
function tags(req, res, next) {
    let xUserID = getUserID(req, res);

    switch (req.method) {
        case "GET":
            Tag.find({ $or: [{members: xUserID}, {creator: xUserID}] }, function(err, tags) {
                if (err) { 
                    res.send("Error getting tags: " + err)
                } else {
                    res.status(200).json(tags);
                }
            }).catch(next);
            break;
        case "POST":
            var form = new multiparty.Form();

            form.parse(req, function(err, fields, files) {
                if (err) {
                    console.log("ERROR IN TAGS FORM.PARSE")
                    res.send("Error in parsing form: " + err)
                    return
                }
                
                mem = fields.members
                if (fields.members[0] == "") {
                    mem = []
                } else {
                    mem = String(fields.members).replace(" ", "")
                    mem = mem.split(",")
                    console.log("Members wasn't empty: " + mem)
                }
                
                var newTag = new Tag();
                newTag.name = fields.name[0]

                newTag.members = mem
                newTag.creator = xUserID;
                newTag.createdAt = Date.now();
                newTag.editedAt = Date.now();

                Tag.findOne({name: newTag.name, creator: xUserID}).then(function(tag) {
                    if (!tag) {
                        newTag.save().then(function(savedTag) {
                            console.log("Saved tag: " + savedTag)
                            res.status(201).json(savedTag)
                        }).catch(next);
                    } else {
                        res.send("Tag named " + newTag.name + " already exists")
                    }
                }).catch(next);
            });
            break;
        default:
            res.send("Method not allowed")
    }
}

// /tags/:tagID
function specificTag(req, res, next) {
    xUserID = getUserID(req, res)

    tagID = req.params.tagID;

    switch (req.method) {
        case "GET":
            Tag.findOne({_id: tagID}).then(function(tag) {
                if (!tag) {
                    res.send("Tag doesn't exist!");
                } else {
                    if (!tag.members.includes(xUserID) && tag.creator != xUserID) {
                        res.status(403).send("You are not a registered viewer nor the creator of this tag.");
                    } else {
                        res.status(200).json(tag)
                    }
                }
            }).catch(next);
            break;
        case "DELETE":
            Tag.findOne({_id: tagID}).then(function(tag) {
                if (!tag) {
                    res.send("Tag doesn't exist!");
                } else if (tag.creator != xUserID) {
                    res.send("You are not the creator of this tag!")
                } else {
                    Tag.deleteOne({_id: tagID}, function(err) {
                        if (err) {
                            res.send("Error: Could not delete tag: " + err)
                        } else {
                            Photo.updateMany({tags: tag}, { $pull: {tags: tag}}).then(function(result) {
                                console.log(result)
                                res.status(200).send("Deleted tag")
                            }).catch(next);
                        }
                    }).catch(next);
                }
            }).catch(next);
            break;
        default:
            res.send("Method not allowed")
    }
}

// /tags/:tagID/:userID
function specificTagMembers(req, res, next) {
    xUserID = getUserID(req, res)

    tagID = req.params.tagID;
    userID = req.params.userID;

    switch (req.method) {
        case "POST":
            Tag.findOne({_id: tagID}).then(function(tag) {
                photoMembers = tag.members
                if (!tag) {
                    res.send("Tag doesn't exist")
                } else if (tag.creator != xUserID) {
                    res.send("You are not the owner of this tag")
                } else {
                    if (photoMembers.includes(userID)) {
                        res.send("User is already a member")
                    } else {
                        console.log("Adding user as member...")
                        photoMembers.push(userID)
                        Tag.findOneAndUpdate({_id: tagID}, {editedAt: Date.now(), members: photoMembers}, {new: true}, (err, updatedTag) => {
                            if (err) {
                                res.send("Error: Couldn't update tag with new user: " + err);
                            } else {
                                res.json(updatedTag)
                            }
                        }).catch(next);
                    }
                }
            }).catch(next);
            break;
        case "DELETE":
            Tag.findOne({_id: tagID}).then(function(tag) {
                photoMembers = tag.members
                if (!tag) {
                    res.send("Tag doesn't exist")
                } else if (tag.creator != xUserID) {
                    res.send("You are not the owner of this tag")
                } else {
                    if (!photoMembers.includes(userID)) {
                        res.send("User is not a member")
                    } else {
                        console.log("Removing user as member...")
                        i = photoMembers.indexOf(userID)
                        photoMembers.splice(i, 1)
                        Tag.findOneAndUpdate({_id: tagID}, {editedAt: Date.now(), members: photoMembers}, {new: true}, (err, updatedTag) => {
                            if (err) {
                                res.send("Error: Couldn't update tag with new user: " + err);
                            } else {
                                res.json(updatedTag)
                            }
                        }).catch(next);
                    }
                }
            }).catch(next);
            break;
        default:
            res.send("Method not allowed")
    }
}

exports.photos = photos
exports.photosByTag = photosByTag
exports.specificPhoto = specificPhoto
exports.tags = tags
exports.specificTag = specificTag
exports.specificTagMembers = specificTagMembers