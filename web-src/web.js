import 'ol/ol.css';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import View from 'ol/View';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Geocoder from 'ol-geocoder';
import Popup from 'ol-popup';
import axios from 'axios';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Circle as CircleStyle, Stroke, Style, Fill, Text } from 'ol/style';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';

import { trilaterate, fromLonLat_epsg4978, toLonLat_epsg4978 } from './trilaterate.js';
import SnailShellMatrix from './SnailShellMatrix.js';
import { flashFeature } from './utils.js';

var searchDistance = 500;
var searchInterval = 25 * 1000;
var flashDuration = 3000;
var cancel = false;
var users = {};
var userIdIndex = 0;
var usersIndex = {};
var usersIgnored = [];
var ssm, flashInterval, currentMarker;

// init OSM OL map
var layer = new TileLayer({
    source: new OSM(),
});

var map = new Map({
    layers: [layer],
    target: 'map',
    view: new View({
        center: [0, 0],
        zoom: 2,
    }),
});

// styles
var stylePositions = new Style({
    image: new CircleStyle({
        fill: new Fill({
            color: 'rgba(55, 200, 150, 0.5)',
        }),
        stroke: new Stroke({
            width: 2,
            color: 'rgba(255, 5, 5, 1)',
        }),
        radius: 7,
    }),
});

let styleUsers = new Style({
    image: new CircleStyle({
        fill: new Fill({
            color: '#fff',
        }),
        stroke: new Stroke({
            width: 2,
            color: 'rgba(0, 0, 0, 1)',
        }),
        radius: 15,
    }),
    text: new Text({
        font: '12px Calibri,sans-serif',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({
            color: '#fff',
            width: 3,
        }),
    }),
});

var source = new VectorSource({
    wrapX: false,
});
var vector = new VectorLayer({
    source: source,
    style: stylePositions,
});
map.addLayer(vector);

var sourceUsers = new VectorSource({
    wrapX: false,
});
var vectorUsers = new VectorLayer({
    source: sourceUsers,
    style: function (feature) {
        styleUsers.getText().setText(feature.get('name'));
        return styleUsers;
    },
});
map.addLayer(vectorUsers);

// add location search
var geocoder = new Geocoder('nominatim', {
    provider: 'osm',
    targetType: 'glass-button',
    lang: 'en',
    placeholder: 'Map search ...',
    limit: 5,
    keepOpen: false,
    autoComplete: true,
});
map.addControl(geocoder);

source.on('addfeature', function (e) {
    currentMarker = e.feature;
    flashFeature(map, layer, currentMarker, flashDuration);
    flashInterval = window.setInterval(
        () => flashFeature(map, layer, currentMarker, flashDuration),
        2000
    );
});

function addPositionMarker(c) {
    var geom = new Point(c);
    var feature = new Feature(geom);
    source.addFeature(feature);
}

function addUserMarker(c, text) {
    var geom = new Point([
        c[0] + Math.floor(Math.random()) * 20,
        c[1] - Math.floor(Math.random()) * 20,
    ]);
    var feature = new Feature(geom);
    feature.set('name', text);
    sourceUsers.addFeature(feature);
}

function searchNearby(searchCoordinates) {
    if (cancel) {
        return;
    }
    addPositionMarker(searchCoordinates);

    let c = toLonLat(searchCoordinates);
    axios
        .post('/getNearby', { lon: c[0], lat: c[1] })
        .then((res) => {
            console.log(`/test response (${res.status})`);

            // stop flashing map marker
            clearInterval(flashInterval);

            let nextPoint = ssm.getNext()[1];

            // trigger searchNearby again for next point
            setTimeout(() => searchNearby(nextPoint), searchInterval);

            // process search results
            refreshNearby(searchCoordinates, res.data);
        })
        .catch((error) => {
            alert(error);
            console.error(error);
        });
}

function refreshNearby(coordinates, nearbyUsers) {
    console.log(`Refresh nearby ${coordinates}`);

    if (!nearbyUsers.constructor == Object || Object.keys(nearbyUsers).length == 0) {
        console.log('Empty result...');
    }

    let now = new Date().getTime();
    for (let i in nearbyUsers) {
        let d = { time: now, coordinates: coordinates, distance: nearbyUsers[i].distance };

        if (users[i] === undefined) {
            users[i] = {};
            users[i].relId = ++userIdIndex;
            usersIndex[users[i].relId] = i;
            users[i].userId = nearbyUsers[i].userId;
            users[i].name = nearbyUsers[i].name;

            if (nearbyUsers[i].photo === undefined) {
                users[i].photo = `/no_photo.png`;
            } else {
                users[i].photo = `/photos/${nearbyUsers[i].photo}`;
            }

            users[i].distances = [d];
            users[i].locations = [];
        } else {
            users[i].distances.push(d);

            if (usersIgnored.includes(users[i].relId)) {
                continue;
            }

            // trilaterate when there are 3 distances
            if (users[i].distances.length % 3 === 0) {
                let lastDistances = users[i].distances.slice(users[i].distances.length - 3);

                let c1 = toLonLat(lastDistances[0].coordinates);
                let c2 = toLonLat(lastDistances[1].coordinates);
                let c3 = toLonLat(lastDistances[2].coordinates);

                let p1 = fromLonLat_epsg4978({ lon: c1[0], lat: c1[1] });
                let p2 = fromLonLat_epsg4978({ lon: c2[0], lat: c2[1] });
                let p3 = fromLonLat_epsg4978({ lon: c3[0], lat: c3[1] });

                p1.r = lastDistances[0].distance;
                p2.r = lastDistances[1].distance;
                p3.r = lastDistances[2].distance;

                let triP = trilaterate(p1, p2, p3, true);
                console.log(`Trilaterated point: ${triP}`);
                if (triP !== null) {
                    let triLonLat = toLonLat_epsg4978(triP);
                    let triC = fromLonLat([triLonLat.lon, triLonLat.lat]);
                    users[i].locations.push({
                        time: now,
                        coordinates: triC,
                    });

                    addUserMarker(triC, users[i].relId.toString());
                }
            }
        }
    }

    let usersSorted = [];
    for (let i in users) {
        usersSorted.push(users[i]);
    }

    usersSorted.sort(function (a, b) {
        if (a.locations > b.locations) return -1;
        if (a.locations < b.locations) return 1;

        if (a.distances > b.distances) return -1;
        if (a.distances < b.distances) return 1;

        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
    });

    let selectedRelId = $('div.active[data-user-id]').attr('data-user-id');
    let newList = $('<div></div>');
    newList.addClass('list list-row block');

    for (let i in usersSorted) {
        let user = usersSorted[i];

        if (usersIgnored.includes(user.relId)) {
            console.log(`Skipping user ${user.relId}`);
            continue;
        }

        let uHtml = `
            <div class="list-group-item list-group-item-action list-item" data-user-id="${user.relId}">
                <div><a href="#"><span class="w-48 avatar gd-primary"><img src="${user.photo}" alt="."></span></a>
                </div>
                <div class="flex user-info"><a href="#" class="item-author text-color">${user.name}</a>
                    <div class="item-except text-sm h-1x">#${user.relId} - 
                    Distances: <span class="badge badge-primary badge-pill">${user.distances.length}</span> 
                    Locations: <span class="badge badge-primary badge-pill">${user.locations.length}</span></div>
                </div>
                <div class="no-wrap">
                    <input type="button" value="Ignore" class="btn_userIgnore btn btn-primary" data-user-id="${user.relId}"/>
                </div>
            </div>`;

        uHtml = $.parseHTML(uHtml);
        newList.append(uHtml);
    }
    $('#chatList').empty();
    $('#chatList').append(newList);
    selectUserInChat(selectedRelId, true);
}

$('#btn_start').click(function () {
    console.log('start search');
    cancel = false;

    // fix position of the start-popup
    map.un('postrender', onMove);

    var x, y;
    [x, y] = map.getView().getCenter();
    ssm = new SnailShellMatrix(searchDistance, x, y);

    searchNearby([x, y]);
});

$('#btn_stop').click(function () {
    console.log('stop search');
    cancel = true;

    // avoid second onMove event trigger
    map.un('postrender', onMove);
    // add onMove to be able to re-position the start-popup
    map.on('postrender', onMove);
});

$('#btn_reset').click(function () {
    console.log('reset map');

    source.clear();
});

$('#txt_gap').change(function () {
    let newSearchDistance = parseInt($(this).val());
    console.log(`Changed search distance value to ${newSearchDistance}`);

    searchDistance = newSearchDistance;
    if (ssm) {
        ssm.setGap = searchDistance;
    }
});

// create start popup and show it when map rendered first time
var popupElement = document.getElementById('popup');
var popup = new Overlay({
    element: popupElement,
});
map.addOverlay(popup);

map.once('postrender', function (event) {
    let coordinates = map.getView().getCenter();
    popup.setPosition(coordinates);

    $(popupElement).popover({
        container: popupElement,
        placement: 'top',
        animation: false,
        html: true,
        content: '<p>Start</p>',
    });

    $(popupElement).popover('show');
});

// move start-popup to the center when the map moves
function onMove() {
    let coordinates = map.getView().getCenter();
    popup.setPosition(coordinates);
}
map.on('postrender', onMove);

// create user popup
var newPopup = new Popup();
map.addOverlay(newPopup);

// UI chat selection
function selectUserInChat(relId, scroll = false) {
    if (relId === undefined) return;

    // scroll chat list
    if (scroll) {
        $('#chatListContainer').scrollTop(0);
        $('#chatListContainer').scrollTop(
            $(`div[data-user-id="${relId}"]`).offset().top - $('#settings').outerHeight()
        );
    }

    // some ui refreshments....
    let thisChat = $(`div.list-group-item[data-user-id="${relId}"]`);
    let others = $('.list-group-item').not(thisChat);
    others.removeClass('active');
    $('> div input', others).addClass('btn-primary').removeClass('btn-light');
    $('> div div span', others).addClass('badge-primary').removeClass('badge-light');

    $(thisChat).addClass('active');
    $('> div input', thisChat).addClass('btn-light').removeClass('btn-primary');
    $('> div div span', thisChat).addClass('badge-light').removeClass('badge-primary');

    // show popup
    let chatId = usersIndex[relId];
    let lastLocation = users[chatId].locations.slice(-1);
    if (lastLocation.length > 0) {
        let c = lastLocation[0].coordinates;

        newPopup.show(
            c,
            `<div><img src="${users[chatId].photo}" width="80" height="80" /><p>${users[chatId].name}</p></div>`
        );
    }
}

// scroll chatList when user feature is clicked on map
map.on('click', function (e) {
    let found = false;
    map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        if (!found && layer == vectorUsers) {
            let relId = feature.get('name');
            selectUserInChat(relId, true);
            found = true;
        }
    });
});

$('#chatList').on('click', 'div', function () {
    let relId = $(this).attr('data-user-id');
    if (relId === undefined) return;

    selectUserInChat(relId);
});

$('#chatList').on('click', '.btn_userIgnore', function () {
    let relId = $(this).attr('data-user-id');
    if (relId === undefined) return;

    console.log(`Add ${relId} to ignore list`);
    $(`div.list-group-item[data-user-id="${relId}"]`).remove();
    usersIgnored.push(parseInt(relId));
});
