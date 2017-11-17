// Process Seinfeld scripts to extract meta-information (such as episode, writer, etc.) as well as individual utterances of the dialogues

// Store each episode's data in a JSON object (a document), subsequently can put into couchDB

// Some of the Regex rules in the parsers were inspired by https://github.com/colinpollock/seinfeld-scripts/blob/master/scrape.py

const fs = require('fs');
const Parser = require("simple-text-parser");

function parsingScriptFile(filePath) {
  const preprocesser = new Parser();
  const metaInfoParser = new Parser();
  const scriptParser = new Parser();

  // Parser usage: 1. define a rule using a regular expression
  // 2. RegExp captured full text and individual groups are passed as arguments to the callback function

  // ****** Preprocessing step ********
  // Delete all spaces at begining of lines
  preprocesser.addRule(/^\s+/gm, '');

  // ******* Parse meta data **********
  // Capture season and episode in season info
  metaInfoParser.addRule(/pc: \d+, season (\d+), episode (\d+)/ig, function(text, season, episode) {
    // return an object describing this tag
    return { season: season, episodeInSeason: episode };
  });
  // Capture episode and title info
  metaInfoParser.addRule(/Episodes* (\d*&*\d+) - (.+)/g, function(text, episodeIndex, title) {
    return { episodeIndex: episodeIndex, title: title };
  });
  // Capture aired date info
  metaInfoParser.addRule(/Broadcast date: (.+)/g, function(text, dateStr) {
    let date = new Date(dateStr);
    return { airedDate: date };
  });
  // Capture writers info
  metaInfoParser.addRule(/Written [Bb]y (.+)/g, function(text, writer) {
    return { writer: writer};
  });
  // Capture director info
  metaInfoParser.addRule(/Directed [Bb]y (.+)/g, function(text, director) {
    return { director: director };
  });

  // ******* Parse script data **********
  // Capture scenes
  scriptParser.addRule(/\[(.+)\]|INT. (.+)/gm, function(scene) {
    return { scene: scene };
  });
  // Capture characters and their utterances
  scriptParser.addRule(/^([A-Z]+): (.+)/gm, function(text, character, utterance) {
    return { character: character, utterance: utterance };
  });

  let metaInfoArray = [];
  let extractedScriptArray = [];
  try {
    const fileStr = fs.readFileSync(filePath, 'utf8');
    const cleanFileIn = preprocesser.render(fileStr);
    metaInfoArray = metaInfoParser.toTree(cleanFileIn)
                      .filter((item) => {
                        return item.type !== "text";
                      });
    extractedScriptArray = scriptParser.toTree(cleanFileIn)
                            .filter((item) => {
                              return item.type !== "text";
                            });
  }
  catch(e) {
    console.log('Error:', e.stack);
  }
  return {metaInfoArray, extractedScriptArray};
}


function constructEpisodeDoc (metaInfoArray, extractedScriptArray) {
  let episode = {};
  metaInfoArray.map((item) => {
    Object.keys(item).forEach((key) => {
      episode[key] = item[key];
    })
  });
  let currentScene = '';
  let dialogues = [];
  for (index=0; index < extractedScriptArray.length; index++) {
    if (extractedScriptArray[index].hasOwnProperty("scene")) {
      currentScene = extractedScriptArray[index].scene.toLowerCase();
    }
    else if (extractedScriptArray[index].hasOwnProperty("utterance")) {
      let dialogue = {
        scene: currentScene,
        character: extractedScriptArray[index].character.toLowerCase(),
        utterance: extractedScriptArray[index].utterance.toLowerCase()
      };
      dialogues.push(dialogue);
    }
  }
  episode.dialogues = dialogues;
  episode['_id'] = 'Episode_' + episode.episodeIndex; // No need to specify,
  episode['type'] = 'Episode'; // these are defined automatically
  //return {episode, dialogues};
  return episode;
}

/*
// Usage
console.log('Running script parser!')
let {metaInfoArray, extractedScriptArray} = parsingScriptFile('./seinfeld_raw_scripts/100and101.txt');
console.log(metaInfoArray);
//console.log(extractedScriptArray.slice(5,15));
//let {episode, dialogues} = constructEpisodeDoc(metaInfoArray, extractedScriptArray);
let episode = constructEpisodeDoc(metaInfoArray, extractedScriptArray);
console.log('episode', Object.keys(episode));
console.log(episode.episodeIndex, episode._id);
//console.log('dialogues', episode.dialogues.length, Object.keys(episode.dialogues[0]));


//const saveToDb = require('./ottomanSaveEpisodeInDatabase');
//saveToDb.createAndSaveEpisode(episode, dialogues);
*/
module.exports = {parsingScriptFile, constructEpisodeDoc};