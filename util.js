/* This could and should be replaced */
var ErrorHandler = function weakErrorHandler(errorMessage) {
	alert(errorMessage);
};


/* Can be replaced. Use in final catch() */
var PromiseCatchHandler = function defaultPromiseCatchHandler(e) {
	if ((typeof e === 'object') && e.hasOwnProperty('message')) {
		throw e;
	} else {
		throw new Error((typeof e === 'string') ? e : 'Unknown reject');
	}
};


window.addEventListener('error', function errorListener(e) {
	e.preventDefault();
	ErrorHandler(e.message ? e.message : 'Unknown error');
});


window.addEventListener('unhandledrejection', function rejectionListener(e) {
	var msg = 'Unknown rejection';

	if (e.reason !== undefined) {
		if (typeof e.reason === 'string') {
			msg = e.reason;
		} else if (e.reason.hasOwnProperty('message')) {
			msg = e.reason.message;
		}
	}

	ErrorHandler(msg);
});


function Ajax(url, config) {
	var xmlHTTP = new XMLHttpRequest();

	if ((config === undefined) || typeof config !== 'object') {
		config = {};
	}

	if (!('type' in config)) {
		config.type = 'GET';
	}

	xmlHTTP.open(config.type, url, true);
	xmlHTTP.responseType = 'json';

	if ('headers' in config) {
		var key;
		for (key of Object.keys(config.headers)) {
			xmlHTTP.setRequestHeader(key, config.headers[key]);
		}
	}

	xmlHTTP.onload = function ajaxOnLoad() {
		if ((this.status.toString())[0] != 2) {
			if (config.error !== undefined) {
				config.error(this.status, 'Bad AJAX request');
			} else {
				throw new Error('Bad AJAX request ' + this.code);
			}
		}

		if (config.success !== undefined) {
			config.success(this.response);
		}
	};

	xmlHTTP.onprogress = function ajaxOnProgress(e) {
		if (!e.lengthComputable) {
			return;
		}

		if (config.progress !== undefined) {
			config.progress(e.loaded, e.total);
		}
	};

	xmlHTTP.onerror = function ajaxOnError(e) {
		if (config.error !== undefined) {
			config.error(this.code, e);
		} else {
			throw new Error('AJAX error ' + this.code);
		}
	};

	xmlHTTP.send();
}


/* Object join from: https://stackoverflow.com/questions/17500312#17500836 */
function join(lookupTable, mainTable, lookupKey, mainKey, select) {
	var l = lookupTable.length;
	var m = mainTable.length;
	var lookupIndex = [];
	var output = [];

	/* Loop through l items */
	var i;
	for (i = 0; i < l; i++) {
		var row = lookupTable[i];
		/* Create an index for lookup table */
		lookupIndex[row[lookupKey]] = row;
	}

	/* loop through m items */
	for (i = 0; i < m; i++) {
		var y = mainTable[i];

		/* Get corresponding row from lookupTable */
		var x = lookupIndex[y[mainKey]];

		/*select only the columns you need*/
		output.push(select(y, x));
	}

	return output;
};
