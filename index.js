import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const port = 3000;
const app  = express();

const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"];
const date = new Date();

let cityLat;
let cityLong;
let cityName = "Tokyo";

// middlewares
app.use(express.static("public"));

// weather API
const API_URL = "http://www.7timer.info/bin/api.pl";

// Geolocation API for finding lat and long to be used in weather API
const GEO_API = "https://api.api-ninjas.com/v1/geocoding";
const API_KEY = "U81ysG9z7bNCmWeX7VTG6A==2zEULYk7YKqqfWbP";


app.use(bodyParser.urlencoded({extended: true}));

app.post("/submit", (req, res) => {
    if (req.body.city) {
        cityName = req.body.city;
    } else {
        cityName = "Tokyo";
    }
    res.redirect("/");
})

app.get("/", async(req, res) => {

    // contruct config for API call
    const geoConfig ={
        headers:{
            "X-Api-Key" : API_KEY,
        },
        params : {
            "city": cityName,
        }
    }

    // get the lat and long of the location
    try {
        const latLong  = await axios.get(GEO_API, geoConfig);
        cityLat  = latLong.data[0].latitude;
        cityLong = latLong.data[0].longitude;
        cityName = latLong.data[0].name;
    } catch (error) {
        if(error) {
            console.error('Request failed:', error);
        };
    }
    // config for weather
    const config = {
        params : {
            lon : cityLong,
            lat : cityLat,
            product: "civil",
            output: "json", 
        }
    }

    // access weather API
    try {
        const result = await axios.get(API_URL, config);
        console.log(result.data.dataseries[1]);
        res.render("index.ejs", {content : {name : cityName, weather: result.data.dataseries[1], date : date.getDate(), day: weekday[date.getDay()]}});
    } catch (error) {
        res.render("index.ejs", JSON.stringify(error.response.data));
    }
})

app.listen(port, () => {
    console.log(`Listening at port ${port}`);
})