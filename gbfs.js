var App;

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

	refreshAfter(30);
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

	update();
}
