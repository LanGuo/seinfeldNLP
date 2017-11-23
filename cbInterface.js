const config = require('./config');
const couchbase = require('couchbase');
const N1qlQuery = couchbase.N1qlQuery;
const fs = require('fs');
const path = require('path');

function upsertEpisodeIntoDb(id, episodeDoc, cbBucket, done) {
  cbBucket.upsert(id, episodeDoc,
  function (err, result) {
    if (err) {
      console.log(`Error when update/inseting episode ${id}`);
      throw err;
    }
    else if (result) {
      console.log(`Updated/inseted episode ${id}`);
      done;
    }
  });
}

function getEpisodeById(id, cbBucket) {
  cbBucket.get(id, function (err, result) {
    if (err) throw err;
    console.log('Got result: %j', result.value);
  });
}

function selectDialoguesByScene(sceneKeywords, bucketName, cbBucket, outputFileName) {
  if (sceneKeywords.length == 1) {
    query_string = (`SELECT dialogues.character, dialogues.utterance
      FROM ${bucketName} AS d
      UNNEST d.dialogues AS dialogues
      WHERE CONTAINS(dialogues.scene, "${sceneKeywords}")`);
  }
  else if (sceneKeywords.length > 1) {
    query_string = `SELECT dialogues.character, dialogues.utterance
      FROM ${bucketName} AS d
      UNNEST d.dialogues AS dialogues
      WHERE CONTAINS(dialogues.scene, "${sceneKeywords[0]}")`
      sceneKeywords.slice(1).forEach(function(word) {
        query_string += ` AND CONTAINS(dialogues.scene, "${word}")`;
      });
  }
  else if (sceneKeywords.length == 0) {
    console.log('Please provide keyword to query scenes!')
  }
  query = N1qlQuery.fromString(query_string); //, keyword=sceneKeyword);
  //console.log(query);
  cbBucket.query(query, function(err, rows) {
    //console.log("Got rows: %s", rows.length);
    if (err) {
      console.log('ERR when querying bucket', err);
    }
    if (rows) {
      const filePath = path.join(config.seinfeld.resultsDir, outputFileName);
      let buildResult = function (initialStr, rowStr) {
        return (initialStr + rowStr);
      };
      let results = rows.map(function(row) {
        return `${row.character}: ${row.utterance} `;
      })
        .reduce(buildResult, '');
      fs.writeFile(filePath, results, err => {
        if (!err) {console.log(`${results.length} characters successfully written to file.`);}
        else {console.log('File writing ERR', err);}
      });
    }
  });
}

function selectDialoguesByCharacter(characterName, cbBucket, outputFileName) {
 query_string = (`SELECT dialogues.scene, dialogues.utterance
  FROM ${cbBucket} AS d
  UNNEST d.dialogues AS dialogues
  WHERE dialogues.character = "${characterName}"`);
  query = N1qlQuery.fromString(query_string); //, keyword=sceneKeyword);
  console.log(query);
  cbBucket.query(query, function(err, rows) {
    if (err) {
      console.log('ERR when querying bucket', err);
    }
    if (rows) {
      console.log(`Got back ${rows.length} rows`)
      let filePath = path.join(config.seinfeld.resultsDir, outputFileName);
      fs.writeFile(filePath, JSON.stringify(rows), err => {
        if (!err) {console.log(`${rows.length} rows successfully written to file.`);}
        else {console.log('File writing ERR', err);}
      });
    }
  });

}

function selectDialoguesBySceneAndCharacter(sceneKeywords, characterName, cbBucket, outputFileName) {
  //console.log(sceneKeywords);
  if ((sceneKeywords.length == 0) | (!characterName)) {
    console.log('Please provide keyword of the scenes and name of the character!');
  }
  else if (sceneKeywords.length == 1) {
    query_string = (`SELECT dialogues.utterance
      FROM ${cbBucket} AS d
      UNNEST d.dialogues AS dialogues
      WHERE CONTAINS(dialogues.scene, "${sceneKeywords}")`);
  }
  else if (sceneKeywords.length > 1) {
    query_string = `SELECT dialogues.utterance
      FROM ${cbBucket} AS d
      UNNEST d.dialogues AS dialogues
      WHERE CONTAINS(dialogues.scene, "${sceneKeywords[0]}")`
      sceneKeywords.slice(1).forEach(function(word) {
        query_string += ` AND CONTAINS(dialogues.scene, "${word}")`;
      });
  }
  query_string += ` AND dialogues.character = "${characterName}"`

  query = N1qlQuery.fromString(query_string); //, keyword=sceneKeyword);
  console.log(query);
  cbBucket.query(query, function(err, rows) {
    //console.log("Got rows: %s", rows.length);
    if (err) {
      console.log('ERR when querying bucket', err);
    }
    if (rows) {
      let filePath = path.join(config.seinfeld.resultsDir, outputFileName);
      fs.writeFile(filePath, JSON.stringify(rows), err => {
        if (!err) {console.log(`${rows.length} rows successfully written to file.`);}
        else {console.log('File writing ERR', err);}
      });
    }
  });
}

function createIndex(indexStr, cbBucket) {
  const query = couchbase.N1qlQuery.fromString(indexStr);
  //console.log(query);
  cbBucket.query(query, function(err, res) {
    if (err){
      console.log("ERR creating index:",err);
    }

    if (res) {
      console.log("Created Index:" + indexStr);
    }
  });
}

module.exports = {upsertEpisodeIntoDb, getEpisodeById, createIndex, selectDialoguesByScene, selectDialoguesByCharacter, selectDialoguesBySceneAndCharacter};
