var http = require('http');
var url = require('url');

var couchbase = require('couchbase');

var myCluster = new couchbase.Cluster('couchbase://localhost');
var myBucket = myCluster.openBucket('travel-sample');

myBucket.get(theQueryString, function(err, res)
{
	myBucket.manager().createPrimaryIndex(function()
	{
		myBucket.query(
			couchbase.N1qlQuery.fromString(theQueryString),
			function (err, rows)
			{
				console.log("Got rows: %j", rows);

				response.writeHead(200, {"Content-Type": "application/json",
							"Access-Control-Allow-Origin": "*"});
				console.log("Returning...");
				response.end(JSON.stringify(rows));
			});
		});
	// });

}).listen(8082);