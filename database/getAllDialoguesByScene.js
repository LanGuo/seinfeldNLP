const config = require('./config')
//const fs = require('fs')
//const parser = require('./parseScriptsToDocsNode')
const cbInterface = require('./cbInterface')
const couchbase = require('couchbase');
const cluster = new couchbase.Cluster('couchbase://localhost/');
cluster.authenticate(config.couchbase.username, config.couchbase.password);
const bucketName = config.couchbase.bucketName;
const bucket = cluster.openBucket(bucketName); // Couchbase Node SDK cannot create a bucket (v.5.0)
//const N1qlQuery = couchbase.N1qlQuery;

console.log(bucket);

/*
const scene = ["comedy club"]// ["jerry","apartment"];
console.log('Running query to get all dialogues')
cbInterface.selectDialoguesByScene(scene, bucketName, bucket, outputFileName='dialogues_jerry_apartment.txt');
//cbInterface.selectDialoguesBySceneAndCharacter(["jerry","apartment"], 'jerry', bucket, outputFileName);
*/

/*
cbInterface.queryDbAndSaveResults(`SELECT dialogues.utterance
  FROM seinfeld_episodes AS d
  UNNEST d.dialogues AS dialogues
  WHERE (CONTAINS(dialogues.scene, "comedy club") OR CONTAINS(dialogues.scene, "opening monologue"))
  AND dialogues.character="jerry"`, '', bucket, 'jerry_monologue.txt');
*/

/*
cbInterface.queryDbAndSaveResults(`SELECT dialogues.utterance
  FROM seinfeld_episodes AS d
  UNNEST d.dialogues AS dialogues
  WHERE dialogues.character="jerry"`, '', bucket, 'jerry_all_dialogues.txt');
*/

cbInterface.queryDbAndSaveResults(`SELECT dialogues.utterance
  FROM seinfeld_episodes AS d
  UNNEST d.dialogues AS dialogues`, '', bucket, 'all_dialogues.txt');
