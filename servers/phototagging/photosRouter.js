var express = require('express');
var modules = require("./modules.js");
var photosRouter = express.Router();

// photosRouter.post("/:photoID/:tagID", modules.tagOnPhoto);
// photosRouter.delete("/:photoID/:tagID", modules.tagOnPhoto);

photosRouter.get("/:photoID", modules.specificPhoto); // GET /photos?tag={tagid} or GET /photos/:tagID
// photosRouter.post("/:photoID/:tagID", modules.specificPhoto);
// photosRouter.patch("/:photoID", modules.specificPhoto);
// photosRouter.delete("/:photoID", modules.specificPhoto);

photosRouter.get("/", modules.photos); // Get all photos
photosRouter.post("/", modules.photos);

module.exports = photosRouter