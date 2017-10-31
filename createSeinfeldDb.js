const parser = require('./parseScriptsToDocsNode')
const cbInterface = require('./cbInterface')
const couchbase = require('couchbase');
const cluster = new couchbase.Cluster('couchbase://localhost/');
const bucket = cluster.openBucket('default');
const N1qlQuery = couchbase.N1qlQuery;
// Can have a config file

// parse every script and save each Episode to db
for (const file of ...) {
console.log('Running script parser!')
let {metaInfoArray, extractedScriptArray} = parser.parsingScriptFile('./seinfeld_raw_scripts/07.txt');
//console.log(metaInfoArray);
//console.log(extractedScriptArray.slice(5,15));
//let {episode, dialogues} = constructEpisodeDoc(metaInfoArray, extractedScriptArray);
let episode = parser.constructEpisodeDoc(metaInfoArray, extractedScriptArray);
console.log('episode', Object.keys(episode));
console.log('dialogues', episode.dialogues.length, Object.keys(episode.dialogues[0]));

cbInterface.upsertEpisodeIntoDb(episode._id, episode, bucket);
};
// After all is done, create primary index and (optional) secondary and array indices
// Testing array indices did not seem to make query faster 20171030??
// Primary Index String
const primaryIndexStr = 'CREATE PRIMARY INDEX episode_id ON ' + config.couchbase.bucket;

const titleIndexStr = 'CREATE INDEX episode_title ON ' + config.couchbase.bucket + ' (title)';
// Secondary Index for finding unencrypted social security numbers
const sceneIndexStr = 'CREATE INDEX dialogue_scene ON ' + config.couchbase.bucket +
  ' (ALL DISTINCT ARRAY v.scene FOR v IN dialogues END)'+
	'WITH {"defer_build":true}';

const characterIndexStr = 'CREATE INDEX dialogue_character ON ' + config.couchbase.bucket +
	' (ALL DISTINCT ARRAY v.character FOR v IN dialogues END)' +
  'WITH {"defer_build":true}';

for indexName, indexStr of {}
cbInterface.createIndex(indexName, indexStr, bucket);