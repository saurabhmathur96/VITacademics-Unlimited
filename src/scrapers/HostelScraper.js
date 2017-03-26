var unirest = require('unirest');
var tabletojson = require('tabletojson');
var Auth = require('vitauth');

function scrapeHostel(hostelLink, opts, callback) {

    const onResponse = function (response) {
        console.log("Scraping Timetable");

        if(response.body==null){
            callback(null, "Scraping error!")
        }
        else {

            console.log("Scraping hostel details!");

            var HostelJsonTable = tabletojson.convert(response.body);
            var block_name = HostelJsonTable[0][0]['8'];
            var room_no = HostelJsonTable[0][0]['10'];

            callback({block: block_name, room: room_no}, null);
        }
    };

    if(opts['cj']) {
        unirest.get(hostelLink)
            .jar(opts['cj'])
            .timeout(28000)
            .end(onResponse);
    }
    else if(opts['regno']){
        Auth.auth(opts['regno'],opts['password'], function (name, reg, cj, err) {
            unirest.get(hostelLink)
                .jar(cj)
                .timeout(28000)
                .end(onResponse);
        });
    }
}

module.exports = scrapeHostel;