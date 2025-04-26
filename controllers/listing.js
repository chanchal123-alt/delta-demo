const Listing = require("../models/listing");
const fetch = require('node-fetch');  // install with: npm install node-fetch



module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{ allListings });
};
 
module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs")
};

module.exports.showListing = async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "listing you requested for does not exist");
        return res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs",{ listing })
};

module.exports.createListing = async (req, res, next) => {
    try {
        const location = req.body.listing.location;
        const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${process.env.MAP_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        let geometry = null;
        if (data.features && data.features.length > 0) {
            geometry = data.features[0].geometry;
        }

        const imageUrl = req.file.path;
        const filename = req.file.filename;

        console.log("Received Listing:", req.body.listing);
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url: imageUrl, filename };

        if (geometry) {
            newListing.geometry = geometry;
        }

        await newListing.save();

        req.flash("success", "New listing created");
        res.redirect("/listings");

    } catch (err) {
        console.error("Error during geocoding or listing creation:", err);
        req.flash("error", "Failed to create listing.");
        res.redirect("/listings");
    }
};


module.exports.editListing = async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    
    if(!listing){
        req.flash("error", "listing you requested for does not exist");
        return res.redirect("/listings");
    }
    
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{ listing, originalImageUrl });
    
};

module.exports.updateListing = async (req,res)=>{
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{ ...req.body.listing });
    
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url,filename };
        await listing.save();
    }
    
    req.flash("success", "listing updated");
    res.redirect(`/listings/${id}`)
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    
    if (!deleteListing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    console.log("Deleted Listing:", deleteListing);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
};

module.exports.index = async (req, res) => {
    const { category, q } = req.query;
    let filter = {};

    if (category) {
        filter.category = category;
    }

    if (q) {
        filter.$or = [
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
        ];
    }

    const listings = await Listing.find(filter); // Apply all filters together

    const filters = [
        { name: "Trending", icon: "fa-fire" },
        { name: "Rooms", icon: "fa-bed" },
        { name: "Iconic Cities", icon: "fa-mountain-city" },
        { name: "Mountains", icon: "fa-mountain" },
        { name: "Castles", icon: "fa-fort-awesome", brand: true },
        { name: "Amazing Pools", icon: "fa-person-swimming" },
        { name: "Camping", icon: "fa-campground" },
        { name: "Farms", icon: "fa-cow" },
        { name: "Arctic", icon: "fa-snowflake", regular: true },
        { name: "Domes", icon: "fa-igloo" },
        { name: "Boats", icon: "fa-ship" },
    ];

    res.render("listings/index", {
        allListings: listings,
        selectedCategory: category || null,
        filters,
        searchQuery: q || ""
    });
};
