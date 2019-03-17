var express = require('express');
var modules = require("./modules.js");
var tagsRouter = express.Router();

// tagsRouter.post("/:photoID/:tagID", modules.tagOnPhoto);
// tagsRouter.delete("/:photoID/:tagID", modules.tagOnPhoto);

tagsRouter.get("/:tagID", modules.specificTag); // GET /photos?tag={tagid} or GET /photos/:tagID
// tagsRouter.patch("/:tagID", modules.specificTag);
// tagsRouter.delete("/:tagID", modules.specificTag);

tagsRouter.get("/", modules.tags); // Get all photos
tagsRouter.post("/", modules.tags);

module.exports = tagsRouter