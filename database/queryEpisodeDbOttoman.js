const ottoman = require('ottoman');
const models = require('./couchModelNode');
const couchbase = require('couchbase');
const cluster = new couchbase.Cluster('couchbase://127.0.0.1');
cluster.authenticate('Administrator', 'password');
ottoman.bucket = cluster.openBucket('default');

const EpisodeModel = models.Episode;
const Dialogue = models.Dialogue;

//function findAllUtterancesOneEpisode(EpisodeModel, episodeIndex) {
EpisodeModel.find({episodeIndex: "6"}, {load: ["dialogues"]}, function(err, oneEpisode) {
	if (err) throw err;
	console.log(oneEpisode);
	dialoguesThisEpisode = oneEpisode.dialogues.forEach((dialogue) => dialogue.utterance);
	console.log(dialoguesThisEpisode);
});
//}

//findAllUtterancesOneEpisode(EpisodeModel, 6);