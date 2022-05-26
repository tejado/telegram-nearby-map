const axios = require("axios");

const options = {
    method: 'GET',
    url: 'https://ukraine-war-data.p.rapidapi.com/data/2021/ukraine-refugee-data/per_country_data.json',
    headers: {
        'X-RapidAPI-Host': 'ukraine-war-data.p.rapidapi.com',
        'X-RapidAPI-Key': '6d69d8a130msh4e3dbbae37f32a7p14a751jsn15e3cf17b9a9'
    }
};

axios.request(options).then(function(response) {
    console.log(response.data);
}).catch(function(error) {
    console.error(error);
});