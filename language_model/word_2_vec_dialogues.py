'''Train a Word2Vec model using gensim on all dialogues in Seinfeld.'''
import os
import gensim, logging
from gensim.models.phrases import Phrases, Phraser
from text_to_sentences import TextToSentencesIterator

logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

dataFile = 'all_dialogues'
inFilePath = '/home/lan/src/seinfeldNLPNode/query_results/{}.txt'.format(dataFile)
sentences = TextToSentencesIterator(inFilePath, True)

#self.bigram is a gensim Bigram object for the bigrams in the text;
#self.listOfPhrasesPerSentence is a list of phrases for each sentence.
def findPhrases(sentences):
    '''
	Function to find bigram phrases from text corpus.
	Args:
		sentences is a list of list, each inner list contains the tokenized words from one sentence.
	Returns:
		bigram is a gensim Bigram object;
		listOfBigramsPerSentence is list of bigrams for each sentence in the corpus.
	'''
    phrases = Phrases(sentences)
    bigram = Phraser(phrases)
    listOfPhrasesPerSentence = [bigram[sentence] for sentence in sentences]
    return bigram, listOfPhrasesPerSentence

modelDir = '/home/lan/src/seinfeldNLPNode/models'
bigram, listOfPhrases = findPhrases(sentences)
bigram.save(os.path.join(modelDir, 'bigram_{}'.format(dataFile)))

model = gensim.models.Word2Vec(listOfPhrases, min_count=2, size=100, workers=4)
model.save(os.path.join(modelDir, 'word2vec_bigram_{}'.format(dataFile)))

model_word = gensim.models.Word2Vec(sentences, min_count=5, size=100, workers=4)
model_word.save(os.path.join(modelDir, 'word2vec_word_{}'.format(dataFile)))
