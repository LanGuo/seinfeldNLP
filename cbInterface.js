const couchbase = require('couchbase');
const N1qlQuery = couchbase.N1qlQuery;

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

function selectDialoguesByScene(sceneKeyword, cbBucket) {
  query_string = (`SELECT dialogues.character, dialogues.utterance
    FROM default AS d
    UNNEST d.dialogues AS dialogues
    WHERE CONTAINS(dialogues.scene, "${sceneKeyword}")`);
  query = N1qlQuery.fromString(query_string); //, keyword=sceneKeyword);
  console.log(query);
  cbBucket.query(query, function (err, rows) {
        console.log("Got rows: %j", rows);
      });
}


module.exports = {upsertEpisodeIntoDb, getEpisodeById, selectDialoguesByScene};
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