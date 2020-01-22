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


function utilTests() {
	QUnit.test('AJAX tests', ajaxTests);
}


function initTests() {
	utilTests();
}
