var Auth = require('vitauth');
var imgrequest = require('request').defaults({encoding: null});
var Image = require('../models/Image').Image;

function scrapeImage(imageLink, regno_param, opts, callback) {

    if(opts['cj']) {
        imgrequest
            .get(imageLink+regno_param, function (err, response) {
                if (!err && response.statusCode == 200) {
                    data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(response.body).toString('base64');
                    console.log(data);
                    var image = new Image({
                        username: regno_param,
                        img: new Buffer(response.body).toString('base64')
                    });
                    image.save(function (err, doc) {
                        callback(err, doc);
                    });
                }
            }).jar(opts['cj']);
    }
    else if(opts['regno']){
        Auth.auth(opts['regno'],opts['password'], function (name, reg, cj, err) {
            imgrequest
                .get(imageLink+regno_param, function (err, response) {
                    if (!err && response.statusCode == 200) {
                        data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(response.body).toString('base64');
                        console.log(data);
                        var image = new Image({
                            username: regno_param,
                            img: new Buffer(response.body).toString('base64')
                        });
                        image.save(function (err, doc) {
                            callback(err, doc);
                        });
                    }
                }).jar(cj);
        });
    }
}

module.exports = scrapeImage;