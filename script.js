var button = document.querySelector('.button')
var latValue = document.querySelector('.latValue')
var lonValue = document.querySelector('.lonValue')
var time = document.querySelector('.time');
var temp = document.querySelector('.temp');
var winds = document.querySelector('.winds');
var winddir = document.querySelector('.winddir');
var chart = document.querySelector('.chart');
import {Feature, Map, Overlay, View} from 'ol/index.js';
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

    const map = new Map({
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

button.addEventListener('click', function(){
    fetch('https://api.open-meteo.com/v1/forecast?latitude='+latValue.value+'&longitude='+lonValue.value+'&hourly=temperature_2m&timeformat=unixtime&current_weather=true&timezone=Europe%2FBerlin&contentType=json')
        .then(response => response.json())
        .then(data => {

            var timeValue = new Date(data['current_weather']['time'] * 1000);
            var tempValue = data['current_weather']['temperature']+data['hourly_units']['temperature_2m'];
            var windsValue = data['current_weather']['windspeed'];
            var winddirValue = data['current_weather']['winddirection'];
            var alltimeValue = data['hourly']['time'];
            for (var i = 0; i < alltimeValue.length; i++){
                var newDateFormat = new Date(alltimeValue[i] * 1000);
                alltimeValue[i] = newDateFormat.getDate()+'/'+newDateFormat.getMonth()+1+'/'+newDateFormat.getFullYear()+' - '+newDateFormat.getHours()+'h';
            };
            var alltempValue = data['hourly']['temperature_2m'];
            time.innerHTML = 'Current Time: ' + timeValue;
            temp.innerHTML = 'Current Temperature: '+ tempValue;
            winddir.innerHTML = 'Current Wind Direction: ' + winddirValue;
            winds.innerHTML = 'Current Wind Speed: '+ windsValue;      
            

            new Chart("canvas", {
                type: "line",
                data: {
                labels: alltimeValue,
                datasets: [{
                    label: '2m Temperature',
                    borderColor:  '#612a2a',
                    tension: 0.1,
                    data: alltempValue,
                    fill: false
                }]
                },
                });
        })

    .catch(err => alert("Wrong values inserted"))


    var latitudetestval = latValue.value;
    var longitudetestval = lonValue.value;  
    createMap(latitudetestval, longitudetestval);
    var mapEl = document.getElementById('map'); 
    mapEl.removeChild(mapEl.firstElementChild);
});

