var unirest = require('unirest');
var tabletojson = require('tabletojson');
var Auth = require('vitauth');

function scrapeTimetable(timetableLink, opts, callback) {

    var courses_cut = [];

    const onResponse = function (response) {
        console.log("Scraping Timetable");

        if(response.body==null){
            callback(null, "Scraping error!")
        }
        else {

            var JsonTable = tabletojson.convert(response.body);
            var courses = JsonTable[1];

            for (var i = 1; i <= courses.length - 3; i++) {
                var course = courses[i];

                var courseObject;

                if (course['5'] == 'Theory Only' || course['5'] == 'Embedded Theory' || course['5'] == 'Soft Skill' || course['5'] == 'Lab Only' || course['5'] == 'Embedded Lab') {
                    courseObject = {
                        slot: courses[i]['9'].split('+'),
                        loc: courses[i]['10']
                    };

                    courses_cut.push(courseObject);
                }
                else if (course['3'] == 'Theory Only' || course['3'] == 'Embedded Theory' || course['3'] == 'Soft Skill' || course['3'] == 'Lab Only' || course['3'] == 'Embedded Lab') {
                    courseObject = {
                        slot: courses[i]['7'].split('+'),
                        loc: courses[i]['8']
                    };
                    courses_cut.push(courseObject);
                }
            }

            callback(courses_cut, null);
        }
    };

    if(opts['cj']) {
        unirest.get(timetableLink)
            .jar(opts['cj'])
            .timeout(28000)
            .end(onResponse);
    }
    else if(opts['regno']){
        Auth.auth(opts['regno'],opts['password'], function (name, reg, cj, err) {
            unirest.get(timetableLink)
                .jar(cj)
                .timeout(28000)
                .end(onResponse);
        });
    }
}

module.exports = scrapeTimetable;