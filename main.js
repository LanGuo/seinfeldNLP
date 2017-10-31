const parser = require('./parseScriptsToDocsNode')
const cbInterface = require('./cbInterface')
const couchbase = require('couchbase');
const cluster = new couchbase.Cluster('couchbase://127.0.0.1'); //localhost/');
cluster.authenticate('Administrator', 'password');
const bucket = cluster.openBucket('default');
const N1qlQuery = couchbase.N1qlQuery;


console.log('Running script parser!')
let {metaInfoArray, extractedScriptArray} = parser.parsingScriptFile('./seinfeld_raw_scripts/168.txt');
//console.log(metaInfoArray);
//console.log(extractedScriptArray.slice(5,15));

let episode = parser.constructEpisodeDoc(metaInfoArray, extractedScriptArray);
console.log('episode', Object.keys(episode));
console.log('dialogues', episode.dialogues.length, Object.keys(episode.dialogues[0]));

cbInterface.upsertEpisodeIntoDb(episode._id, episode, bucket);

//const id = 'Episode_7';
//cbInterface.getEpisodeById(id, bucket);

//const indexName = 'dialogue_scene';
//const indexStr = 'CREATE INDEX dialogue_scene ON ' +
//	'default' +
//    ' (DISTINCT ARRAY v.scene FOR v IN dialogues END)';

//const indexName = 'episode_id';
//const indexStr = 'CREATE PRIMARY INDEX episode_id ON ' + 'default';
//cbInterface.createIndex(indexName, indexStr, bucket);
//console.log('running query')
//cbInterface.selectDialoguesByScene(["jerry","apartment"], bucket);
//cbInterface.selectDialoguesBySceneAndCharacter(["jerry","apartment"], 'jerry', bucket);