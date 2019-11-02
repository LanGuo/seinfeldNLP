const ottoman = require('ottoman');
const models = require('./ottomanModel');
const couchbase = require('couchbase');
const cluster = new couchbase.Cluster('couchbase://127.0.0.1');
ottoman.bucket = cluster.openBucket('default');

const Episode = models.Episode;
const Dialogue = models.Dialogue;

function createAndSaveEpisode(episode, dialogues) {
	let allDialogues = [];
	dialogues.forEach(function(dialogue) {
		const oneDialogue = new Dialogue(dialogue);
		allDialogues.push(oneDialogue);
	});
	episode.dialogues = allDialogues;
	const oneEpisode = new Episode(episode);

	oneEpisode.save(function(err) {
		if (err) {
			console.log('Error encountered while saving an episode!');
			throw err;
		}
		console.log(`Episode ${episode['_id']} Saved!`);
	});
	ottoman.ensureIndices(function(err) {
	  if (err) {
	    console.log('failed to created necessary indices', err);
	    return;
	  }

	  console.log('ottoman indices are ready for use!');
	});
}

module.exports = {createAndSaveEpisode};