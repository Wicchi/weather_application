var button = document.querySelector('.button')
var latValue = document.querySelector('.latValue')
var lonValue = document.querySelector('.lonValue')
var time = document.querySelector('.time');
var temp = document.querySelector('.temp');
var winds = document.querySelector('.winds');
var winddir = document.querySelector('.winddir');
var chart = document.querySelector('.chart');
import Chart from 'chart.js/auto';
import {Map as myMap} from 'ol/index.js';
import {Feature, Overlay, View} from 'ol/index.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Point} from 'ol/geom.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {useGeographic} from 'ol/proj.js';
import 'ol/ol.css'


 function createMap(latitudetest, longitudetest){
    useGeographic();
    const places = [longitudetest, latitudetest];
    const place = places.map(Number);
    const point = new Point(place);


    const mapVector = new VectorLayer({
    source: new VectorSource({
        features: [new Feature(point)],
    }),
    style: {
        'circle-radius': 9,
        'circle-fill-color': '#612a2a',
    }});

    const map = new myMap({
    target: 'map',
    view: new View({
        center: place,
        zoom: 8,
    }),
    layers: [
        new TileLayer({
        source: new OSM(),
        }),
        mapVector,
    ],
    });

    const element = document.getElementById('popup');

    const popup = new Overlay({
    element: element,
    stopEvent: false,
    });
    map.addOverlay(popup);

    function formatCoordinate(coordinate) {

    return `
        <table>
        <tbody>
            <tr><th>lon</th><td>${coordinate[0].toFixed(2)}</td></tr>
            <tr><th>lat</th><td>${coordinate[1].toFixed(2)}</td></tr>
        </tbody>
        </table>`;
    }


    let popover;
    map.on('click', function (event) {
    if (popover) {
        popover.dispose();
        popover = undefined;
    }
    const feature = map.getFeaturesAtPixel(event.pixel)[0];
    if (!feature) {
        return;
    }
    const coordinate = feature.getGeometry().getCoordinates();
    popup.setPosition([
        coordinate[0] + Math.round(event.coordinate[0] / 360) * 360,
        coordinate[1],
    ]);

    popover = new bootstrap.Popover(element, {
        container: element.parentElement,
        content: formatCoordinate(coordinate),
        html: true,
        offset: [0, 20],
        placement: 'top',
        sanitize: false,
    });
    popover.show();
    });

    map.on('pointermove', function (event) {
    const type = map.hasFeatureAtPixel(event.pixel) ? 'pointer' : 'inherit';
    map.getViewport().style.cursor = type;
    });

 };
createMap(50.07, 14.44);

let cache = {};
async function getData(url){
    let result = "";
    if(cache[url] !== undefined) return cache[url].value;

    await fetch(url)
    .then(response => response.json())
    .then(json => cache[url] = {coordinate: new Date(), value: json});

    return cache[url].value;
}


setInterval(function (){
    if(Object.keys(cache).length > 0){
        let currentTime = new Date();
        Object.keys(cache).forEach(key => {
            let seconds = currentTime - cache[key].time;
            if(seconds > 10000){
                delete cache[key];
                console.log(`${key}'s cache deleted`)
            }
        })
    }
}, 3000);

const urlconsctructor = function(){
    let checkedElements = document.querySelectorAll('.filled-in:checked');
    let checkedline = [];
    for (let i of checkedElements){
        checkedline.push(i.value)
    }
    Array.prototype.map.call(checkedline, s => s).toString();       
    let url = 'https://api.open-meteo.com/v1/forecast?latitude='+latValue.value+'&longitude='+lonValue.value+'&hourly='+checkedline+'&timeformat=unixtime&current_weather=true&timezone=Europe%2FBerlin&contentType=json&past_days=27'
    return url;
}



const plotchar = function(data, element, labels){
    let ctx = element + "_chart"
    new Chart(ctx, {
        type: "line",
        data: {
        labels: labels,
        datasets: [{
            label: [`${element}`] +data['hourly_units'][`${element}`],
            borderColor:  '#612a2a',
            tension: 0.1,
            data: data['hourly'][`${element}`],
            fill: false
        }]
        },
        });
}


button.addEventListener('click', function(){
    getData(urlconsctructor())
        .then(data => {
            var timeValue = new Date(data['current_weather']['time'] * 1000);
            var tempValue = data['current_weather']['temperature']+" °C";
            var windsValue = data['current_weather']['windspeed'] + " kmh";
            var winddirValue = data['current_weather']['winddirection'] + " °";
            let checkedElements = document.querySelectorAll('.filled-in:checked');
            if (checkedElements){
                var alltimeValue = data['hourly']['time'];
                for (var i = 0; i < alltimeValue.length; i++){
                    var newDateFormat = new Date(alltimeValue[i] * 1000);
                    alltimeValue[i] = newDateFormat.getDate()+'/'+newDateFormat.getMonth()+1+'/'+newDateFormat.getFullYear()+' - '+newDateFormat.getHours()+'h';
                };
                debugger;

                for (let a of checkedElements){
                    a = a.value
                    debugger;
                    plotchar(data, a, alltimeValue);
                };
                           
            }

            time.innerHTML = 'Current Time: ' + timeValue;
            temp.innerHTML = 'Current Temperature: '+ tempValue;
            winddir.innerHTML = 'Current Wind Direction: ' + winddirValue;
            winds.innerHTML = 'Current Wind Speed: '+ windsValue;       
        })
        
    .catch(err => alert("Wrong values inserted"))


    var latitudetestval = latValue.value;
    var longitudetestval = lonValue.value;  
    createMap(latitudetestval, longitudetestval);
    var mapEl = document.getElementById('map'); 
    mapEl.removeChild(mapEl.firstElementChild);
});

