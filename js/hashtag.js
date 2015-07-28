//get current date and calculate last 7 days
var today = new Date();
var first = today.getDate() - today.getDay();
var currentDates = [];

//hashtag values
var hashtag1 = "summer";
var hashtag2 = "vacation";
var hashtag3 = "sun";
var currentHashtag = 0;
var apiKey = "09C43A9B270A470B8EB8F2946A9369F3";

//get JSON value for hashtags
function getHashtagData(h, n) {
    currentHashtag = n;
    $.ajax({
        url: "http://otter.topsy.com/searchhistogram.js?q=%23" + h + "&apikey=" + apiKey,
        dataType: 'jsonp',
        success: function(results) {
            var event = jQuery.Event("hashtag-data-received");
            currentHashtag = n;
            $(document).trigger(event, results.response);

        }
    });
}

//arrays to store data in
var hashtag1Values = new Array(7 + 1).join('0').split('').map(parseFloat);
var hashtag2Values = new Array(7 + 1).join('0').split('').map(parseFloat);
var hashtag3Values = new Array(7 + 1).join('0').split('').map(parseFloat);

// set the dashboard to make a report request every 5 minutes
var time = 300000; // milliseconds
var interval = setInterval(makeRequest, time);


$(document).on("hashtag-data-received", function(event, results) {
    // pull the last 7 days
    // formatted data is [100, 200, 300, ...] (1st day last)
    for (j = 6; j >= 0; j--) {
        window['hashtag' + currentHashtag + 'Values'][j] = results.histogram[j];
    }
    //   window['hashtag' + currentHashtag + 'Values'] = window['hashtag' + currentHashtag + 'Values'].reverse();
});

//fill arrays with data and graph
function makeRequest() {
    getHashtagData(hashtag1, 1);
    getHashtagData(hashtag2, 2);
    getHashtagData(hashtag3, 3);
    setTimeout(createGraph, 500);
}

function createGraph() {
    $('#hashtagGraph').highcharts({
        title: {
            text: 'Hashtag Comparison Dashboard',
            x: -20 //center
        },
        subtitle: {
            text: 'Normal View',
            x: -20
        },
        xAxis: {
            categories: currentDates,
            title: {
                text: 'Day'
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Hashtag Count'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: "#" + hashtag1,
            data: hashtag1Values.reverse(),
            lineWidth: 2,
            states: {
                hover: {
                    enabled: true,
                    lineWidth: 2
                }
            }
        }, {
            name: "#" + hashtag2,
            data: hashtag2Values.reverse(),
            lineWidth: 1,
            states: {
                hover: {
                    enabled: true,
                    lineWidth: 1
                }
            }
        }, {
            name: "#" + hashtag3,
            data: hashtag3Values.reverse(),
            lineWidth: 3,
            states: {
                hover: {
                    enabled: true,
                    lineWidth: 2
                }
            }
        }]
    });

}

//set date array
function setDates() {
    formatDate(today);
    for (var i = 0; i < 6; i++) {
        var next = new Date(today.getTime());
        next.setDate(first - i);
        formatDate(next);
    }
    currentDates = currentDates.reverse();
}

//format dates
function formatDate(d) {
    var actualDate = "";
    var locale = "en-us";
    var month = d.toLocaleString(locale, {
        month: "long"
    });
    actualDate = month + " " + d.getDate() + ", " + d.getFullYear();
    currentDates.push(actualDate);
}

//parse hashtag value
function parseHashtag(h) {
    h = h.replace(/\W/g, '');
    return h;
}

$(document).on("click", "#refresh-dashboard", function() {
    hashtag1 = parseHashtag($('#ht1').val());
    hashtag2 = parseHashtag($('#ht2').val());
    hashtag3 = parseHashtag($('#ht3').val());
    makeRequest();
});

//the window reload function. you could of course do anything here
function forceMidnightPageReload() {
    window.location.reload(true);
}
//helper function to build up the desire time trigger
function forceMidnightPageReloadGetTargetTime(hour, minute) {
    var t = new Date();
    t.setHours(hour);
    t.setMinutes(minute);
    t.setSeconds(0);
    t.setMilliseconds(0);
    return t;
}
//get your offset to wait value
var timetarget = forceMidnightPageReloadGetTargetTime(24, 01).getTime();
var timenow = new Date().getTime();
var offsetmilliseconds = timetarget - timenow;
//if it is midnight, set a timeout.
if (offsetmilliseconds >= 0) {
    setTimeout(function() {
        forceMidnightPageReload();
    }, offsetmilliseconds);
}


//initialcalls
setDates();
makeRequest();