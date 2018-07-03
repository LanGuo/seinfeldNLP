'''
Adpated from https://github.com/fchollet/keras/blob/master/examples/lstm_text_generation.py
and https://machinelearningmastery.com/text-generation-lstm-recurrent-neural-networks-python-keras/
Considerations:
*how long should the time series for lstm be (maxlen param)?
*what's the difference training the model with 50 iterations and epoch=1 vs epoch=50?
*stateful vs stateless RNN?
'''
from __future__ import print_function
import os
from keras.models import Sequential
from keras.layers import Dense, Activation
from keras.layers import LSTM
from keras.layers import Dropout
from keras.optimizers import RMSprop
from keras.callbacks import ModelCheckpoint
import numpy as np

topic = 'all_dialogues'
#inputPath = '/home/lan/src/seinfeldNLPNode/query_results/dialogues_jerry_apartment.txt'
#inputPath = '/home/lan/src/seinfeldNLPNode/query_results/jerry_monologue.txt'
inputPath = '/home/lan/src/seinfeldNLPNode/query_results/{}.txt'.format(topic)

text = open(inputPath).read().lower()
print('corpus length:', len(text))

chars = sorted(list(set(text)))
print('total chars:', len(chars))
char_indices = dict((c, i) for i, c in enumerate(chars))
indices_char = dict((i, c) for i, c in enumerate(chars))

# cut the text in semi-redundant sequences of maxlen characters
maxlen = 30 #100
step = 3
sentences = []
next_chars = []
for i in range(0, len(text) - maxlen, step):
    sentences.append(text[i: i + maxlen])
    next_chars.append(text[i + maxlen])
print('nb sequences:', len(sentences))

print('Vectorization...')
x = np.zeros((len(sentences), maxlen, len(chars)), dtype=np.bool)
y = np.zeros((len(sentences), len(chars)), dtype=np.bool)
for i, sentence in enumerate(sentences):
    for t, char in enumerate(sentence):
        x[i, t, char_indices[char]] = 1
    y[i, char_indices[next_chars[i]]] = 1


layers = 1
# build the model: a single layer LSTM
print('Build model...')
model = Sequential()
model.add(LSTM(256, input_shape=(maxlen, len(chars))))
#model.add(LSTM(256, input_shape=(maxlen, len(chars)), return_sequences=True))
model.add(Dropout(0.2))
#model.add(LSTM(256))
#model.add(Dropout(0.2))
model.add(Dense(len(chars)))
model.add(Activation('softmax'))

#optimizer = RMSprop(lr=0.01) #could try the 'adam' optimizer
optimizer = 'adam'
model.compile(loss='categorical_crossentropy', optimizer=optimizer)

# define the checkpoint and save the model progress
weightsFilename = "weights-{epoch:02d}-{loss:.4f}.hdf5"
weightsDir = os.path.join('/home/lan/src/seinfeldNLPNode/models/', 'lstm_{}_maxlen{}_{}_{}layers'.format(topic, maxlen, optimizer, layers))
if not os.path.exists(weightsDir):
    os.mkdir(weightsDir)
weightsFilepath = os.path.join(weightsDir, weightsFilename)
checkpoint = ModelCheckpoint(weightsFilepath, monitor='loss', verbose=1, save_best_only=True, mode='min')
callbacks_list = [checkpoint]
# fit the model
epochs = 30
batchSize = 128
model.fit(x, y, epochs=epochs, batch_size=batchSize, callbacks=callbacks_list)

