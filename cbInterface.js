const couchbase = require('couchbase');
const N1qlQuery = couchbase.N1qlQuery;
const fs = require('fs');

function upsertEpisodeIntoDb(id, episodeDoc, cbBucket) {
  cbBucket.upsert(id, episodeDoc,
  function (err, result) {
    if (err) {
      console.log(`Error when update/inseting episode ${id}`);
      throw err;
    }
    console.log(`Updated/inseted episode ${id}`);
  });
}

function getEpisodeById(id, cbBucket) {
  cbBucket.get(id, function (err, result) {
    if (err) throw err;
    console.log('Got result: %j', result.value);
  });
}

function selectDialoguesByScene(sceneKeywords, cbBucket) {
  //console.log(sceneKeywords);
  if (sceneKeywords.length == 1) {
    query_string = (`SELECT dialogues.character, dialogues.utterance
      FROM default AS d
      UNNEST d.dialogues AS dialogues
      WHERE CONTAINS(dialogues.scene, "${sceneKeywords}")`);
  }
  else if (sceneKeywords.length > 1) {
    query_string = `SELECT dialogues.character, dialogues.utterance
      FROM default AS d
      UNNEST d.dialogues AS dialogues
      WHERE CONTAINS(dialogues.scene, "${sceneKeywords[0]}")`
      sceneKeywords.slice(1).forEach(function(word) {
        query_string += `AND CONTAINS(dialogues.scene, "${word}")`;
      });
  }
  else if (sceneKeywords.length == 0) {
    console.log('Please provide keyword to query scenes!')
  }
  query = N1qlQuery.fromString(query_string); //, keyword=sceneKeyword);
  console.log(query);
  cbBucket.query(query, function(err, rows) {
    //console.log("Got rows: %s", rows.length);
    if (err) {
      console.log('ERR when querying bucket', err);
    }
    if (rows) {
      let fileName = `./result.txt`;
      fs.writeFile(fileName, JSON.stringify(rows), err => {
        if (!err) {console.log(`${rows.length} rows successfully written to file.`);}
        else {console.log('File writing ERR', err);}
      });
    }
  });
}

function selectDialoguesByCharacter(characterName, cbBucket) {
 query_string = (`SELECT dialogues.scene, dialogues.utterance
  FROM default AS d
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
    }
  });

}

function selectDialoguesBySceneAndCharacter(sceneKeywords, characterName, cbBucket) {
  //console.log(sceneKeywords);
  if ((sceneKeywords.length == 0) | (!characterName)) {
    console.log('Please provide keyword of the scenes and name of the character!');
  }
  else if (sceneKeywords.length == 1) {
    query_string = (`SELECT dialogues.utterance
      FROM default AS d
      UNNEST d.dialogues AS dialogues
      WHERE CONTAINS(dialogues.scene, "${sceneKeywords}")`);
  }
  else if (sceneKeywords.length > 1) {
    query_string = `SELECT dialogues.utterance
      FROM default AS d
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
      let fileName = `./result.txt`;
      fs.writeFile(fileName, JSON.stringify(rows), err => {
        if (!err) {console.log(`${rows.length} rows successfully written to file.`);}
        else {console.log('File writing ERR', err);}
      });
    }
  });
}

function createIndex(indexName, indexStr, cbBucket) {
  const query = couchbase.N1qlQuery.fromString(indexStr);
  console.log(query);
  cbBucket.query(query, function(err, res) {
    if (err){
      console.log("ERR creating index:",err);
    }

    if (res) {
      console.log("Created Index:" + indexName);
    }
  });
}

module.exports = {upsertEpisodeIntoDb, getEpisodeById, createIndex, selectDialoguesByScene, selectDialoguesByCharacter, selectDialoguesBySceneAndCharacter};
/*
bucket.manager().createPrimaryIndex(function() {
  bucket.upsert('user:king_arthur', {
    'email': 'kingarthur@couchbase.com', 'interests': ['Holy Grail', 'African Swallows']
  },
  function (err, result) {
    bucket.get('user:king_arthur', function (err, result) {
      console.log('Got result: %j', result.value);
      bucket.query(
      N1qlQuery.fromString('SELECT * FROM default WHERE $1 in interests LIMIT 1'),
      ['African Swallows'],
      function (err, rows) {
        console.log("Got rows: %j", rows);
      });
    });
  });
});
*/