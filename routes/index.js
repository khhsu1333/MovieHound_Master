var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');
var request = require("request");

// GET home page.
exports.index = function(req, res, next) {
	res.render('index', { title: 'Express' });
};

// GET slave info.
exports.slave = function(req, res, next) {
	var db = req.db;
	db.collection('slaves').find({}, function(err, cursor) {
		cursor.toArray(function(err, documents) {
			slaves = documents;

			// Sort snapshot list
			utils.sortResults(slaves, 'speed', false);
			
			// Response matched list
			res.json(slaves.slice(0, slaves.length >= 10 ? 10 : slaves.length));
		});
	});
};

// POST receive heartbeat
exports.heartbeat = function(req, res, next) {
	var db = req.db;
	ip = req.param('ip');
	speed = req.param('speed');
	db.collection('slaves').update({ip : ip}, {$set : {speed : speed}}, function(err, result) {
		res.send(
			(err === null) ? { error: undefined } : { error: err }
		);
	});
};

// POST add new slave.
exports.add_slave = function(req, res, next) {
	var db = req.db;
	db.collection('slaves').update(req.body, req.body, { upsert : true }, function(err, result) {
		res.send(
			(err === null) ? { error: undefined } : { error: err }
		);
	});
};

// POST search snapshots.
exports.search = function(req, res, next) {
	var db = req.db;
	var file = req.files.snapshot;

	if(file == null) res.end();
	if('image/jpeg' != file.mimetype) res.end();

	// Call exec to get hash
	var exec = require('child_process').exec;
	exec('python utils/PreProcess.py ' + file.path, function (err, stdout, stderr) {
		hash = stdout;
		snapshotList = [];
		count = 0;

		// Request slave to search the snapshots
		db.collection('slaves').find({}, function(err, cursor) {
			cursor.toArray(function(err, documents) {
				// Check if got hash
				console.log('Hash: ' + hash);

				// Request slave to search snapshot
				for(i = 0; i < documents.length; i++) {
					var IP = documents[i].ip;
					request({
						uri: 'http://' + IP + '/search',
						method: "POST",
						form: {
							hash: hash
						}
					}, function(error, response, body) {
						// Append response into list
						snapshotList = snapshotList.concat(body);

						count += 1;
						if(count == documents.length) {
							// Finish searching.
							console.log('DONE!!!');

							// Sort snapshot list
							utils.sortResults(snapshotList, 'distance', true);
							
							// Response matched list
							res.json(snapshotList.slice(0, snapshotList.length >= 10 ? 10 : snapshotList.length));
						}
					});
				}
			});
		});
	});
};
