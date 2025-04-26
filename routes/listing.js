const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage })

const { isLoggedIn,isOwner,validateListing } = require("../middleware.js");

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

//edit
router.get("/:id/edit",
    isLoggedIn,
    isOwner, wrapAsync(listingController.editListing));

router
    .route("/:id")
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,wrapAsync(listingController.updateListing))
    .get(wrapAsync(listingController.showListing))
    .delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));


module.exports = router;