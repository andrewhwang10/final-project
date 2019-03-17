var express = require('express');
var modules = require("./modules.js");
var tagsRouter = express.Router();

// Add & remove members from tags (share and unshare)
tagsRouter.post("/:tagID/:userID", modules.specificTagMembers);
tagsRouter.delete("/:tagID/:userID", modules.specificTagMembers);

// Retrieve tag information & delete tag
tagsRouter.get("/:tagID", modules.specificTag); // GET /photos?tag={tagid} or GET /photos/:tagID
// tagsRouter.patch("/:tagID", modules.specificTag);
tagsRouter.delete("/:tagID", modules.specificTag);

// Get tags & create new tags
tagsRouter.get("/", modules.tags);
tagsRouter.post("/", modules.tags);

module.exports = tagsRouter