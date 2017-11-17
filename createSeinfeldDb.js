
const config = require('./config')
const fs = require('fs')
const parser = require('./parseScriptsToDocsNode')
const cbInterface = require('./cbInterface')
const couchbase = require('couchbase');
const cluster = new couchbase.Cluster('couchbase://localhost/');
cluster.authenticate(config.couchbase.username, config.couchbase.password);
const bucket = cluster.openBucket(config.couchbase.bucket); // Couchbase Node SDK cannot create a bucket (v.5.0)
const N1qlQuery = couchbase.N1qlQuery;

// parse every episode script and save each Episode to db
const rawScriptPath = config.seinfeld.rawscriptFolder;
fs.readdir(rawScriptPath, function(err, items) {
  for (var i=0; i<items.length; i++) {
      console.log(`processing episode ${i}`);
      let {metaInfoArray, extractedScriptArray} = parser.parsingScriptFile(rawScriptPath + items[i]);
      let episode = parser.constructEpisodeDoc(metaInfoArray, extractedScriptArray);
      // After all episodes are inserted into database, create primary index and (optional) secondary and array indices
      // Testing array indices did not seem to make query faster though - 20171030
      let done = function(i) {
        if (i === items.length-1) {
          // Primary Index String
          let indexStrs = [];
          const primaryIndexStr = 'CREATE PRIMARY INDEX episode_id ON ' + config.couchbase.bucket;
          indexStrs.push(primaryIndexStr);
          // Secondary Index for episode titles
          const titleIndexStr = 'CREATE INDEX episode_title ON ' + config.couchbase.bucket + ' (title)';
          indexStrs.push(titleIndexStr);
          // Array indices for scenes
          const sceneIndexStr = 'CREATE INDEX dialogue_scene ON ' + config.couchbase.bucket +
            ' (ALL DISTINCT ARRAY v.scene FOR v IN dialogues END)'+
            'WITH {"defer_build":true}';
          indexStrs.push(sceneIndexStr);
          // Array indices for characters
          const characterIndexStr = 'CREATE INDEX dialogue_character ON ' + config.couchbase.bucket +
            ' (ALL DISTINCT ARRAY v.character FOR v IN dialogues END)' +
            'WITH {"defer_build":true}';
          indexStrs.push(characterIndexStr);

          for (const indexStr of indexStrs) {
            cbInterface.createIndex(indexStr, bucket);
          };
        }
      };
      cbInterface.upsertEpisodeIntoDb(episode._id, episode, bucket, done(i));
  };

  

  
});

