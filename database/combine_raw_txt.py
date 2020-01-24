import os

raw_txt_dir = '/home/lan/src/seinfeldNLPNode/seinfeld_raw_scripts'
output_path = '/home/lan/src/seinfeldNLPNode/query_results/all_scripts.txt'

with open(output_path, 'a') as outfile:
	for file in os.listdir(raw_txt_dir):
		if file.endswith('.txt'):
			with open(os.path.join(raw_txt_dir, file), 'r') as onefile:
				lines = onefile.readlines()
				text = ' '.join([l.strip('\t\n') for l in lines])
				outfile.write(text + '<|endoftext|>')
				onefile.close()