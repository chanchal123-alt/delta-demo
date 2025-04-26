if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const dbURL = process.env.ATLASDB_URL;
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require("passport");
const LocalStorage = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


app.engine('ejs', ejsMate);
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl : dbURL,
    crypto : {
        secret: process.env.SECRET,
    },
    touchAfter : 24 * 3600,
});

store.on("error",()=>{
    console.log("error in mongo db");
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  // Fixed: Date.now()
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, 
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStorage(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});



main()
.then(() => {
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbURL);
}

// app.js or server.js
app.use((req, res, next) => {
    res.locals.searchQuery = req.query.q || "";
    next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
});


// app.get("/", (req, res) => {
//     res.send("This is the root");
// });

app.listen(8080, () => {
    console.log("Server is listening on port: 8080");
});






// app.get("/demouser",async(req,res)=>{
//     let fakeuser = new User({
//         email: "chanchal@gmail.com",
//         username: "delta-student",
//     });
    
//     let registeredUser = await User.register(fakeuser,"helloworld");
//     res.send(registeredUser);
// });