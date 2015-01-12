var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');
var request = require("request");

// GET home page.
exports.index = function(req, res, next) {
	res.render('index', { title: 'Express' });
};

// GET manage page.
exports.manage = function(req, res, next) {
	res.render('manage');
};

// GET slave list.
exports.slave = function(req, res, next) {
	var db = req.db;
	db.collection('slaves').find({}, function(err, cursor) {
		cursor.toArray(function(err, documents) {
			slaves = documents;
			var cur = new Date();

			// Calculate status
			for(i=0; i < slaves.length; i++) {
				// 若是超過 20 分鐘則判斷 Slave 已經斷線
				start = new Date(documents[i].timestamp);
				if(cur - start >1200000) {
					slaves[i].status = false;
				} else {
					slaves[i].status = true;
				}
			}
			// Response matched list
			res.json(slaves);
		});
	});
};

// GET ask slave address to upload data.
exports.allocate = function(req, res, next) {
	var db = req.db;
	db.collection('slaves').find({}, function(err, cursor) {
		cursor.toArray(function(err, documents) {
			slaves = [];
			var cur = new Date();

			// Calculate status
			for(i=0; i < documents.length; i++) {
				// 若是超過 20 分鐘則判斷 Slave 已經斷線
				start = new Date(documents[i].timestamp);
				if(cur - start <= 1200000) {
					slaves.push(documents[i]);
				}
			}

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
	name = req.param('name');
	IP = req.param('IP');
	speed = req.param('speed');
	timestamp = req.param('timestamp');
	amount = req.param('amount');
	if(name != undefined && IP != undefined && speed != undefined && timestamp != undefined && amount != undefined) {
		a = db.collection('slaves').find({name:name, IP:IP}).toArray(function(err, documents) {
			if(documents.length == 0) {
				db.collection('slaves').insert(req.body, function(err, result) {
					console.log('Add new slave.');
					res.send(
						(err === null) ? { error: undefined } : { error: err }
					);
				});
			} else if(documents.length == 1) {
				db.collection('slaves').update({name:name, IP:IP}, {$set:{speed:speed, timestamp:timestamp, amount:amount}}, function(err, result) {
					res.send(
						(err === null) ? { error: undefined } : { error: err }
					);
				});
			} else {
				db.collection('slaves').remove({name:name, IP:IP});
			}
		});
	}
};

// POST search snapshots.
exports.search = function(req, res, next) {
	var db = req.db;
	var file = req.files.snapshot;

	if(null != file && 'image/jpeg' == file.mimetype) {
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
						var IP = documents[i].IP;
						request({
							uri: 'http://' + IP + '/search',
							method: "POST",
							form: {
								hash: hash
							}
						}, function(error, response, body) {
							// Append response into list
							if(body != null && body.length != 0) {
								body = body.slice(1, body.length-1);
								parts = body.split('},');
								for(i=0; i < parts.length; i++) {
									if(parts[i].indexOf('}') == -1)
										parts[i] += '}';
									obj = JSON.parse(parts[i]);
									snapshotList.push(obj);
								}
							}

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
	} else {
		res.send( {error:'錯誤的檔案型態，僅允許 JPG 型態的截圖。'});
	}
};
