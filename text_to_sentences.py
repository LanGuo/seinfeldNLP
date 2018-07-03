'''
A class to generate an iterator of sentences from a text file.
'''
import string
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from gensim.summarization.textcleaner import split_sentences

# Note for future implementations:
'''
From https://groups.google.com/forum/#!msg/gensim/17Knu4Xoe9U/bYRSTCTWCQAJ
While all those are all common techniques in related text-processing efforts, the word2vec/doc2vec practices are often different.

For example, the original word2vec paper and evaluations didn't mention any stemming/lemmatization or stop-word removal, and retained punctuation as word-like tokens.

The words in the 3 million Google pre-trained vector set (from GoogleNews stories) aren't stemmed/lemmatized, include stop-words and mixed-case words, and use some other form of numerics-flattening. 

The original 'Paragraph Vector' paper (on which gensim's Doc2Vec is based), and a followup ("Document Embedding with Paragraph Vectors"), seemed to do things similarly – with no mention of extra preprocessing before calculating doc-vectors for their sentiment/topicality evaluations. 

It's possible the influence of stop-words and punctuation may be different (and more positive) in Word2Vec/Doc2Vec training than in other forms of NLP. For example, with respect to bootstrapping word-vectors, these tokens might provide a useful signal by aligning words commonly used with the same stop-words, or with certain shifts in sentences/clauses/etc, and thus indicate some relevant aspect-of-similarity. With a sole focus on modeling document topicality – as for example in pure Doc2Vec PV-DBOW mode – perhaps they'd be less useful. But it may be something worth evaluating with respect to your own corpus/goals.

- Gordon
'''
# -- Sentence class for turning text into cleaned-up sentences -- #
class TextToSentencesIterator(object):
    '''
    Takes a file on disk and does text clean up, remove English stop words and punctuations,
    optional tokenization and/or finding bigrams using gensim and nltk.
    Generate list of isolated sentences (each sentence is a list of words).
    The resulting lists are stored as properties of the object:
    self.text is the cleaned up raw text;
    self.listOfSentences is the list of sentences.
    This object can be used as an itorator for looping over the isolated sentences list.
    '''
    def __init__(self, filename, tokenize=True):
        self.filename = filename
        with open(filename, 'r') as myfile:
            self.text = myfile.read()
            # -- Convert strange utf-8 bytes into punctuations -- #
            self.replaceStrangeChrs()
        # -- Preprocessing: generate a list of sentences -- #
        self.listOfSentences = [sentence.lower() for sentence in split_sentences(self.text)]

        # -- Optional: Perform word tokenization -- #
        if tokenize:
            self.tokenizeSentences()
        # -- Remove English stopwords -- #
        #self.removeStopWordsFromSentences()
        # -- Remove Punctuations -- #
        #self.removePunctuationsFromSentences()

    def __iter__(self):
        for sentence in self.listOfSentences:
            yield sentence

    def replaceStrangeChrs(self):
        #self.text.replace('\n', '').replace(u'\xa0', u' ')
        self.text = self.text.encode().decode('utf-8')
        strangeChrs = [b'\xe2\x80\x9d', b'\xe2\x80\x9c', b'\xe2\x80\x98', b'\xe2\x80\x99']
        targetChrs = ['"', '"', "'", "'"]
        conversionTb = {ord(strangeChrs[i].decode('utf-8')): targetChrs[i] for i in range(len(strangeChrs))}
        conversionTb.update({ord('\n'): '', ord(u'\xa0'): ' '})
        self.text = self.text.translate(conversionTb)

    # -- optional preprocessing such as stemming/tokenizing, getting rid of stop words, finding phrases -- #
    def tokenizeSentences(self):
        self.listOfSentences = [word_tokenize(sentence) for sentence in self.listOfSentences]

    def removeStopWordsFromSentences(self):
        stopWords = set(stopwords.words('english'))
        self.listOfSentences = [[word for word in sentence if word not in stopWords] for sentence in self.listOfSentences]

    def removePunctuationsFromSentences(self):
        excludePunc = set(string.punctuation)
        excludePunc.update({'--', '...', '``', '..', '......'})
        self.listOfSentences = [[word for word in sentence if word not in excludePunc] for sentence in self.listOfSentences]


if __name__ == '__main__':
    sentences = FileToCleanSentences('/home/lan/src/seinfeldNLPNode/query_results/all_dialogues.txt',True,True)
