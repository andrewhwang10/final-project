var express = require('express');
var modules = require("./modules.js");
var photosRouter = express.Router();


// Adding tag
photosRouter.post("/:photoID/:tagID", modules.specificPhoto);
// Remove tag
photosRouter.delete("/:photoID/:tagID", modules.specificPhoto);

// Get photos with specific tag
photosRouter.get("/:tagID", modules.photosByTag)

// Get photo
photosRouter.get("/:photoID", modules.specificPhoto);
// Like and unlike
photosRouter.post("/:photoID", modules.specificPhoto);
// Delete photo
photosRouter.delete("/:photoID", modules.specificPhoto);

photosRouter.get("/", modules.photos);
photosRouter.post("/", modules.photos);

module.exports = photosRouter