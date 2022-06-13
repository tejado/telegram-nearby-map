const axios = require("axios");

const options = {
    method: 'GET',
    url: 'https://ukraine-war-live.p.rapidapi.com/news',
    headers: {
        'X-RapidAPI-Host': 'ukraine-war-live.p.rapidapi.com',
        'X-RapidAPI-Key': '6d69d8a130msh4e3dbbae37f32a7p14a751jsn15e3cf17b9a9'
    }
};

axios.request(options).then(function(response) {
    console.log(response.data);
    var doc = document.querySelector('h1');
    doc.innerText = response.data;


}).catch(function(error) {
    console.error(error);
});