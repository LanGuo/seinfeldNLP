const parser = require('./parseScriptsToDocsNode')
const cbInterface = require('./cbInterface')
const couchbase = require('couchbase');
const cluster = new couchbase.Cluster('couchbase://localhost/');
const bucket = cluster.openBucket('default');
const N1qlQuery = couchbase.N1qlQuery;

console.log('Running script parser!')
let {metaInfoArray, extractedScriptArray} = parser.parsingScriptFile('./seinfeld_raw_scripts/07.txt');
//console.log(metaInfoArray);
//console.log(extractedScriptArray.slice(5,15));
//let {episode, dialogues} = constructEpisodeDoc(metaInfoArray, extractedScriptArray);
let episode = parser.constructEpisodeDoc(metaInfoArray, extractedScriptArray);
console.log('episode', Object.keys(episode));
console.log('dialogues', episode.dialogues.length, Object.keys(episode.dialogues[0]));

cbInterface.upsertEpisodeIntoDb(episode._id, episode, bucket);
//const id = '7';
//cbInterface.getEpisodeById(id, bucket);
cbInterface.selectDialoguesByScene("jerry\'s apartment", bucket);