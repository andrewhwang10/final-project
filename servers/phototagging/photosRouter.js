var express = require('express');
var modules = require("./modules.js");
var photosRouter = express.Router();

photosRouter.post("/:photoID/:tagID", modules.tagOnPhoto);
photosRouter.delete("/:photoID/:tagID", modules.tagOnPhoto);

photosRouter.get("/:photoID", modules.specificPhoto); // GET /photos?tag={tagid} or GET /photos/:tagID

// Like and unlike
photosRouter.post("/:photoID", modules.specificPhoto);
// Adding tag
photosRouter.post("/:photoID/:tagID", modules.specificPhoto);
// Delete photo
photosRouter.delete("/:photoID", modules.specificPhoto);
// Remove tag
photosRouter.delete("/:photoID/:tagID", modules.specificPhoto);

photosRouter.get("/", modules.photos); // Get all photos
photosRouter.post("/", modules.photos);

module.exports = photosRouter