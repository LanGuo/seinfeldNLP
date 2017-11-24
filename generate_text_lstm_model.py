'''
Generating text with the trained lstm model with the lowest loss
'''
from __future__ import print_function
import os
import random
import sys
from keras.models import Sequential
from keras.layers import Dense, Activation
from keras.layers import LSTM
from keras.layers import Dropout
from keras.optimizers import RMSprop
import numpy as np

inputPath = '/home/lan/src/seinfeldNLPNode/query_results/dialogues_jerry_apartment.txt'
text = open(inputPath).read().lower()
print('corpus length:', len(text))

chars = sorted(list(set(text)))
print('total chars:', len(chars))
char_indices = dict((c, i) for i, c in enumerate(chars))
indices_char = dict((i, c) for i, c in enumerate(chars))
maxlen = 100
generatedLen = 1000


def sample(preds, temperature=1.0):
    # helper function to sample an index from a probability array
    preds = np.asarray(preds).astype('float64')
    preds = np.log(preds) / temperature
    exp_preds = np.exp(preds)
    preds = exp_preds / np.sum(exp_preds)
    probas = np.random.multinomial(1, preds, 1)
    return np.argmax(probas)

# Build the same model and load the network weights from the model with lowest loss
model = Sequential()
model.add(LSTM(256, input_shape=(maxlen, len(chars))))
model.add(Dropout(0.2))
model.add(Dense(len(chars)))
model.add(Activation('softmax'))
weightsFilename = "dialogues-jerry-apt-weights-adam-30-0.9964.hdf5"
#"dialogues-jerry-apt-weights-improvement-09-1.3708.hdf5"
weightsFilepath = os.path.join('/home/lan/src/seinfeldNLPNode/models/', weightsFilename)
model.load_weights(weightsFilepath)
optimizer = RMSprop(lr=0.01) #could try the 'adam' optimizer
model.compile(loss='categorical_crossentropy', optimizer=optimizer)#'adam')

# Pick a random seed for generating text
start_index = random.randint(0, len(text) - maxlen - 1)

for diversity in [0.2, 0.5, 1.0, 1.2]:
    #print()
    print('----- diversity:', diversity)

    generated = ''
    sentence = text[start_index: start_index + maxlen]
    generated += sentence
    print('----- Generating with seed: "' + sentence + '"')
    sys.stdout.write(generated)

    # generate next character at each step
    for i in range(generatedLen):
        x_pred = np.zeros((1, maxlen, len(chars)))
        for t, char in enumerate(sentence):
            x_pred[0, t, char_indices[char]] = 1.

        preds = model.predict(x_pred, verbose=0)[0]
        next_index = sample(preds, diversity)
        next_char = indices_char[next_index]

        generated += next_char
        sentence = sentence[1:] + next_char

        sys.stdout.write(next_char)
        #sys.stdout.flush()
    print()
