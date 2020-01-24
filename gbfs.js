var App;
var Map;
var MapMarkers = {};

const GBFS = 'https://gbfs.urbansharing.com/oslobysykkel.no/';
const CID  = 'stigmh-sykkelmonitor';


/* Replace weak error handler */
ErrorHandler = function errorHandler(errorMessage) {
	if (App) {
		App.error = errorMessage;
	} else {
		alert(errorMessage);
	}
};


function getData(url, desc) {
	App.status = 'Henter ' + desc;

	return new Promise(function dataPromise(resolve, reject) {
		Ajax(url, {
			/**
			 * The API wants us to provide a Client-Identifier
			 * request header. But their server's 
			 * access-control-expose-headers response header
			 * does not allow us to provide it. 
			 * 
			 * headers {
			 *	'Client-Identifier': CID
			 *},
			 */
			success: function(data) {
				App.progress = undefined;
				resolve(data);
			},
			progress: function(loaded, total) {
				App.progress = Math.round(total / loaded);
			},
			error: function(code, error) {
				App.status = 'Feil ved henting av ' + desc.toLowerCase();
				reject((error ? error : 'AJAX error') + ' (' + code + ')');
			}
		});
	});
};


function getStations()
{
	return getData(GBFS + 'station_information.json', 'stasjoner');
}


function getStatus()
{
	return getData(GBFS + 'station_status.json', 'status');
}


function updateDOM(stations, status)
{
	App.stations = join(status, stations,
		'station_id', 'station_id',
		function(station, stationStatus) {
			return {
				name: station.name,
				address: station.address,
				lat: station.lat,
				lon: station.lon,
				is_installed: stationStatus.is_installed,
				is_renting: stationStatus.is_renting,
				is_returning: stationStatus.is_returning,
				num_bikes_available: stationStatus.num_bikes_available,
				num_docks_available: stationStatus.num_docks_available,
				station_id: station.station_id,
			};
		}
	);

	updateMarkers();

	refreshAfter(30);
}


function updateMarkers()
{
	var i;
	for (i in App.stations) {
		var dom = '<div class="station-name center-text">' + App.stations[i].name
			+ '</div><div class="width50">Ledige låser:</div>'
			+ '<div class="width50">Ledige sykler:</div>'
			+ '<div class="width50 big-text">' + App.stations[i].num_docks_available + '</div>'
			+ '<div class="width50 big-text">' + App.stations[i].num_bikes_available + '</div>';

		if (!MapMarkers.hasOwnProperty(App.stations[i].station_id)) {
			MapMarkers[App.stations[i].station_id] = L.marker(
				[App.stations[i].lat, App.stations[i].lon]).addTo(Map);

			MapMarkers[App.stations[i].station_id].bindPopup(dom);
		} else {
			MapMarkers[App.stations[i].station_id]._popup.setContent(dom);
		}
	}
}


async function update()
{
	var stations = await getStations();
	var status = await getStatus();

	updateDOM(stations.data.stations, status.data.stations);
}


function refreshAfter(seconds)
{
	App.status = 'Oppdaterer om ' + seconds + 's';

	if (seconds) {
		return setTimeout(refreshAfter.bind(null, --seconds), 1000);
	}

	update();
}


function getPosition()
{
	navigator.geolocation.getCurrentPosition(function gotPosition(pos) {
		Map.setView([ pos.coords.latitude, pos.coords.longitude ]);
	}, function failedPosition(err) {},{
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	});
}


function initMap()
{
	var token;

	Map = L.map('mapid').setView([59.913536, 10.755783], 19);

	L.tileLayer(
		'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
		{
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">'
				+ 'OpenStreetMap</a> contributors, '
				+ '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
				+ ', Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
				+ ', Bike data <a href="https://oslobysykkel.no/apne-data/sanntid">Oslo Bysykkel</a>',
			maxZoom: 20,
			minZoom: 4,
			id: 'mapbox/streets-v11',
			accessToken: 'pk.eyJ1Ijoic3RpZ21oYSIsImEiOiJjazVzbHJzMGgwbmNmM25tbDVwN3cyM3h1In0.EefcEBwXmNxyXLHycH9djg'
		}
	).addTo(Map);
	getPosition();
}


function init() {
	App = new Vue({
		el: '#app',
		data: {
			stations: [],
			status: 'Initialiserer',
			error: undefined,
			progress: undefined
		}
	});

	initMap();
	update();
}
