const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";


main()
.then(()=>{
    console.log("connected TO DB");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner : "67fc9bd035347bf2e7744941",
    })); 
    await Listing.insertMany(initData.data);
    console.log("The data was Initialized");
};

initDB();