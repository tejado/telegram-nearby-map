const axios = require("axios");
const { response } = require("express");

const options = {
    method: 'GET',
    url: 'https://ukraine-war-live.p.rapidapi.com/news/guardian',
    headers: {
        'X-RapidAPI-Key': '6d69d8a130msh4e3dbbae37f32a7p14a751jsn15e3cf17b9a9',
        'X-RapidAPI-Host': 'ukraine-war-live.p.rapidapi.com'
    }
};

axios.request(options).then(function(response) {
    console.log(response.data);
}).catch(function(error) {
    console.error(error);
});

const title = response.data.title;
const url = response.data.url;

console.log(response.data.title);