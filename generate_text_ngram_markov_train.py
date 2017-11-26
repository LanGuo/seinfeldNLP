'''
A simple ngram markov train to generate text.
'''
from __future__ import print_function
import os
import numpy
import pickle
from nltk.util import ngrams
from nltk.tokenize import word_tokenize

def generate_context_word_dict_from_text(text, n):
    '''
    Take a corpus of text and generate a ngram dictionary, using nltk word tokenizer to split text into words first,
    then use nltk ngrams util to generate list of ngrams.
    Returns a dictionary containing context (n-1grams) as keys and the last word of the ngram as values.
    :param text: the source data to be converted to ngrams
    :type text: sequence or iter
    :param n: the degree of the ngrams, the generated context will have dimension of n-1
    :type n: int
    '''
    tokenizedText = word_tokenize(text)
    ngramsFromText = list(ngrams(tokenizedText, n))  # The result is a list of tuples containing n consecutive words

    contextWordDict = {}
    for ngram in ngramsFromText:
        context = ngram[:-1]  # This is a tuple so can be a dictionary key
        word = ngram[-1]
        if context in contextWordDict:
            contextWordDict[context].append(word)
        elif context not in contextWordDict:
            contextWordDict.update({context: [word]})
    return contextWordDict


def generate_text_from_seed(seed, contextWordDict):
    '''
    Takes a random tuple of words (seed) and generate the next word based on contextWordDict.
    '''
    assert(isinstance(seed, tuple)), 'seed must be a tuple'
    contextLength = len(list(contextWordDict.keys())[0])
    if len(seed) >= contextLength:
        seed = seed[-contextLength:]
        if seed in contextWordDict:
            nextWord = numpy.random.choice(contextWordDict[seed])
        else:
            potentialContexts = [context for context in contextWordDict.keys() if (seed[-1] in context or seed[0] in context)]
            seed = potentialContexts[numpy.random.choice(len(potentialContexts))]
            nextWord = numpy.random.choice(contextWordDict[seed])
    elif len(seed) < contextLength:
        potentialContexts = [context for context in contextWordDict.keys() if seed in context]
        seed = potentialContexts[numpy.random.choice(len(potentialContexts))]
        nextWord = numpy.random.choice(contextWordDict[seed])
    elif len(seed) == 0:
        print('Please provide a seed context!')

    return nextWord

if __name__ == '__main__':
    CASE = 2

    inputPath = '/home/lan/src/seinfeldNLPNode/query_results/dialogues_jerry_apartment.txt'
    sourceText = open(inputPath).read().lower()
    n = 2  # The degree of ngram to base the contextWordDict on
    seedLen = n - 1
    generateLen = 300  # Number of words to generate as a squence

    if CASE == 1:
        contextWordDict = generate_context_word_dict_from_text(sourceText, n)
        dictFilename = "context-to-word-dict-based-on-{}-gram.pickle".format(n)
        dictFilepath = os.path.join('/home/lan/src/seinfeldNLPNode/models/', dictFilename)
        pickle_out = open(dictFilepath,"wb")
        pickle.dump(contextWordDict, pickle_out)
        pickle_out.close()

    elif CASE == 2:
        tokenizedText = word_tokenize(sourceText)
        startInd = numpy.random.randint(0, len(tokenizedText))
        seed = tuple(tokenizedText[startInd: startInd + seedLen])
        result = seed
        dictFilename = "context-to-word-dict-based-on-{}-gram.pickle".format(n)
        dictFilepath = os.path.join('/home/lan/src/seinfeldNLPNode/models/', dictFilename)
        pickle_in = open(dictFilepath,"rb")
        contextWordDict = pickle.load(pickle_in)

        print("--- Generating text based on {} gram model and markov train using seed '{}' ---\n".format(n,seed))
        for i in range(generateLen):
            nextWord = generate_text_from_seed(seed, contextWordDict)
            result += (nextWord,)
            seed = tuple(result[-seedLen:])

        print(' '.join(result))