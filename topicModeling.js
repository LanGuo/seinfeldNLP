// References:
// https://www.slideshare.net/NodejsFoundation/text-mining-with-nodejs-philipp-burckhardt-carnegie-mellon-university-66868664

const tm = require('text-miner');
const stdlib = require('@stdlib/stdlib')
const lda = stdlib.nlp.lda;

const seinfeldSTOPWORDS = tm.STOPWORDS.EN;
seinfeldSTOPWORDS.push('hey','yeah',"'", 'uh', 'mmm', 'er', 'um', 'eh'); //This could go into config?

function createCorpusFromUtterances(utteranceObj) {
  let input = utteranceObj.map(function(x) {
      return tm.utils.expandContractions(x.utterance);
    });
  let corpus = new tm.Corpus(input);

  let cleanCorpus = corpus.trim()
    .toLower()
    .removeInvalidCharacters()
    .removeInterpunctuation()
    .removeWords(seinfeldSTOPWORDS)
    .stem()
    .clean();
  return cleanCorpus;
}

function ldaTopicModel(cleanCorpus, numOfTopics, iterations, burnin, thin) {
  let docs = cleanCorpus.documents; //.getTexts();
  docs = docs.filter(function(x) {
    return (x.length != 0);
  }); // get rid of empty docs
  console.log('docs filtered:', docs);
  let model = lda(docs, numOfTopics); // lda(<Documents Array>, <Number of Topics>)
  model.fit(iterations, burnin, thin); // model.fit(<Iterations>, <Burnin>, <Thin>)
  return model;
}

function getTopTermsForTopic(model, topicInd, numOfTopTerms) {
  // Get top n words for each topic
  let terms = model.getTerms(topicInd, numOfTopTerms);
  console.log(`Top ${numOfTopTerms} terms for topic ${topicInd}`, terms);
  return terms;
}


const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('./the_reverse_peephole.txt', 'utf8'));
//console.log(obj);
const cleanCorpus = createCorpusFromUtterances(obj);
console.log(cleanCorpus);
const ldaModel = ldaTopicModel(cleanCorpus, 3, 1000, 100, 10);
const terms = getTopTermsForTopic(ldaModel, 0);
