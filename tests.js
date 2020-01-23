var Vue;

var dataSet0 = [
{
	"station_id": "627",
	"name": "Skøyen Stasjon",
	"address": "Skøyen Stasjon",
	"lat": 59.9226729,
	"lon": 10.6788129,
	"capacity": 20
},
{
	"station_id": "623",
	"name": "7 Juni Plassen",
	"address": "7 Juni Plassen",
	"lat": 59.9150596,
	"lon": 10.7312715,
	"capacity": 15
},
{
	"station_id": "610",
	"name": "Sotahjørnet",
	"address": "Sotahjørnet",
	"lat": 59.9099822,
	"lon": 10.7914482,
	"capacity": 20
}];

var dataSet1 = [{
	"is_installed": 1,
	"is_renting": 1,
	"num_bikes_available": 7,
	"num_docks_available": 5,
	"last_reported": 1540219230,
	"is_returning": 1,
	"station_id": "623" /* Index 1 dataSet0 */
},
{
	"is_installed": 1,
	"is_renting": 1,
	"num_bikes_available": 4,
	"num_docks_available": 8,
	"last_reported": 1540219230,
	"is_returning": 1,
	"station_id": "610" /* Index 2 dataSet0 */
},
{
	"is_installed": 1,
	"is_renting": 1,
	"num_bikes_available": 4,
	"num_docks_available": 9,
	"last_reported": 1540219230,
	"is_returning": 1,
	"station_id": "627" /* Index 0 dataSet0 */
}];


function ajaxTests(assert)
{
	assert.expect(4);
	var done = assert.async(3);

	Ajax('https://gbfs.urbansharing.com/oslobysykkel.no/gbfs.json',
	{
		success: (data) => {
			assert.ok(1, 'AJAX GET works');
			assert.strictEqual(typeof data, 'object',
				'Returned data is JSON');
			done();
		},
		error: (c, e) => {
			assert.ok(0, `AJAX GET failed (${c})`);
			assert.strictEqual(typeof c, 'number',
				`Returned code is a number`);
			done();
		}
	});

	Ajax('https://gbfs.urbansharing.com/oslobysykkel.no/garbage.json',
	{
		success: (data) => {
			assert.ok(0, 'AJAX GET should fail');
			done();
		},
		error: (c, e) => {
			assert.ok(1, `AJAX GET failed propely (${c})`);
			done();
		}
	});

	Ajax('https://gbfs.urbansharing.com/oslobysykkel.no/gbfs.json',
	{
		headers: {
			'Client-Identifier': 'stigmh-sykkeltest'	
		},
		success: (data) => {
			assert.ok(0, 'Client-Identifier works now, implement it!');
			done();
		},
		error: (c, e) => {
			assert.ok(1, `Client-Identifier still fails as expected (${c})`);
			done();
		}
	});
}


function joinTests(assert)
{
	assert.expect(dataSet0.length + 4);

	var joined = join(dataSet1, dataSet0,
		'station_id', 'station_id',
		function(d0, d1) {
			assert.strictEqual(d0.station_id, d1.station_id,
				`d0 station_id ${d0.station_id} matches d1 ${d1.station_id}`);

			return {
				'id:': d0.station_id,
				'name': d0.name,
				'lat': d0.lat,
				'lon': d0.lon,
				'bikes': d1.num_bikes_available,
				'docks': d1.num_docks_available
			};
		}
	);

	assert.strictEqual(dataSet0.length, joined.length, 'joined data has proper size');
	assert.strictEqual(dataSet0[0].name, joined[0].name, 'Join index 0 has sane name parameter');
	assert.strictEqual(dataSet1[2].num_bikes_available, joined[0].bikes, 'Join index 2 has sane bikes parameter');
	assert.strictEqual(dataSet1[1].num_docks_available, joined[2].docks, 'Join index 1 has sane docks parameter');
}


function getDataTest(assert) {
	var done = assert.async(2);
	var randomStr = String(Math.random() * 1000000);

	getData('https://gbfs.urbansharing.com/oslobysykkel.no/station_information.json', randomStr)
	.then((data) => {
		assert.ok(1, 'getData() works');
		assert.strictEqual(typeof data, 'object',
			'Returned data is JSON');
		done();
	})
	.catch((e) => {
		assert.ok(0, `getData() failed: ${e}`);
		done();
	});

	assert.strictEqual(App.status, `Henter ${randomStr}`, 'App sets status properly');

	getData('https://gbfs.urbansharing.com/oslobysykkel.no/lolrandom.json', randomStr)
	.then((data) => {
		assert.ok(0, 'getData() succeeds on bogus URL!?');
		done();
	})
	.catch((e) => {
		assert.ok(1, `getData() fails as expected: ${e}`);
		assert.strictEqual(App.status, `Feil ved henting av ${randomStr}`,
			'App sets error status properly');
		done();
	});
}


function getStationsTest(assert) {
	var done = assert.async(1);

	getStations().then((stations) => {
		var i;
		var requiredKeys = [
			'name', 'address', 'lat', 'lon', 'station_id'
		];

		assert.strictEqual(typeof stations, 'object',
			'Returned data is JSON');
		assert.ok(stations.hasOwnProperty('data'), 'JSON has data property');
		assert.ok(stations.data.hasOwnProperty('stations'), 'JSON data has stations property');
		assert.ok(stations.data.stations.length > 0, 'stations data has more than one entry');

		for (i = 0; i < requiredKeys.length; ++i) {
			assert.ok(stations.data.stations[0].hasOwnProperty(requiredKeys[i]),
				`stations has required property ${requiredKeys[i]}`);
		}

		done();
	});

	assert.strictEqual(App.status, 'Henter stasjoner', 'App sets status properly');
}


function getStatusTest(assert) {
	var done = assert.async(1);

	getStatus().then((status) => {
		var i;
		var requiredKeys = [
			'is_installed', 'is_renting', 'is_returning', 'num_bikes_available',
			'num_docks_available', 'station_id'
		];

		assert.strictEqual(typeof status, 'object',
			'Returned data is JSON');
		assert.ok(status.hasOwnProperty('data'), 'JSON has data property');
		assert.ok(status.data.hasOwnProperty('stations'), 'JSON data has stations property');
		assert.ok(status.data.stations.length > 0, 'stations data has more than one entry');

		for (i = 0; i < requiredKeys.length; ++i) {
			assert.ok(status.data.stations[0].hasOwnProperty(requiredKeys[i]),
				`staus has required property ${requiredKeys[i]}`);
		}

		done();
	});

	assert.strictEqual(App.status, 'Henter status', 'App sets status properly');
}


function updateDOMTest(assert) {
	var originalRefresh = refreshAfter;

	refreshAfter = function fakeRefresh(time) {
		assert.strictEqual(typeof time, 'number', 'update gives sane number');
		assert.ok((time > 0), `refresh interval is positive (${time})`);
		refreshAfter = originalRefresh;
	};

	updateDOM(dataSet0, dataSet1);

	assert.strictEqual(dataSet0.length, App.stations.length,
		'processed data has proper size');
	assert.strictEqual(dataSet0[0].name, App.stations[0].name,
		'data index 0 has sane name parameter');
	assert.strictEqual(dataSet1[2].num_bikes_available,
		App.stations[0].num_bikes_available,
		'data index 2 has sane bikes parameter');
	assert.strictEqual(dataSet1[1].num_docks_available,
		App.stations[2].num_docks_available,
		'data index 1 has sane docks parameter');
}


function refreshAfterTest(assert) {
	var done = assert.async(1);
	var originalUpdate = update;
	var start = window.performance.now();

	update = function fakeUpdate() {
		assert.ok((window.performance.now() - start) >= 2000, 'timeout works well');
		assert.strictEqual(App.status, 'Oppdaterer om 0s', 'App still sets status properly');
		update = originalUpdate;
		done();
	};

	refreshAfter(2);
	assert.strictEqual(App.status, 'Oppdaterer om 2s', 'App sets status properly');
}


function updateTest(assert) {
	var original = updateDOM;
	var done = assert.async(1);

	updateDOM = function fakeUpdateDOM(stations, status) {
		/* Check objects */
		assert.strictEqual(typeof stations, 'object', 'stations is object');
		assert.strictEqual(typeof status, 'object', 'status is object');
		assert.ok(stations.length > 0, 'one or more entries in stations');
		assert.strictEqual(stations.length, status.length,
			'stations and status are same length');

		/* Ensure they have at least one of the unique identfying parameters */
		assert.ok(stations[0].hasOwnProperty('lat'), 'stations has lat property');
		assert.ok(status[0].hasOwnProperty('is_renting'),
			'stations has is_renting property');

		updateDOM = original;
	};

	update().then(function() {
		done();
	});
}


function initTest(assert) {
	assert.expect(4);
	var originalUpdate = update;

	update = function fakeInitUpdate() {
		assert.ok(1, 'init calls update');
		update = originalUpdate;
	};

	Vue = function (obj) {
		assert.strictEqual(obj.el, '#app',
			'inits el property properly');
		assert.strictEqual(obj.data.stations.length, 0,
			'inits stations property properly');
		assert.strictEqual(obj.data.status, 'Initialiserer',
			'inits status property properly');
	};

	init();
}


function utilTests() {
	/**
	 * We should ideally test error handlers first, but it's a bit
	 * cumbersome as QUnit steals the error handlers
	 */
	QUnit.test('AJAX tests', ajaxTests);
	QUnit.test('JSON Join tests', joinTests);
}


function gbfsTests() {
	QUnit.test('init() test', initTest);

	App = {};

	QUnit.test('getData() tests',      getDataTest);
	QUnit.test('getStations() tests',  getStationsTest);
	QUnit.test('getStatus() tests',    getStatusTest);
	QUnit.test('updateDOM() tests',    updateDOMTest);
	QUnit.test('update() tests',       updateTest);
	QUnit.test('refreshAfter() tests', refreshAfterTest);
}


function initTests() {
	utilTests();
	gbfsTests();
}
