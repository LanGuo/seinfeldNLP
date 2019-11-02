// Node.js
// scrape Seinology.com for all the Seinfeld scripts and store them locally

const request = require('request');
const cheerio = require("cheerio");
const fs = require('fs');

const rootURL = 'http://www.seinology.com/scripts-english.shtml';
const baseURL = 'http://www.seinology.com/';

function scrapeAllEpisodes(url, baseURL) {
  request(url, (err, response, html) => {
    if (!err) {
      console.log(`Successfully accessed ${url}`);
      // Parsing HTML
      let $ = cheerio.load(html);
      // select elements with episode links
      $('a[href*="scripts/script-"]').map(function(){
        let data = $(this);
        let episodeHref = data.attr('href');
        let episodeURL = baseURL + episodeHref;
        console.log(episodeURL);
        let episodeNum = episodeHref.split('-')[1].replace('.shtml', '');
        let fileName = `./seinfeld_raw_scripts/${episodeNum}.txt`;

        if ((!fs.existsSync(fileName)) || (fs.statSync(fileName).size == 0)) {
          scrapeEpisode(episodeNum, episodeURL);
        }
        else {
          console.log(`Episode ${episodeNum} has already been saved to disk.`)
        }
      });
    }
  });
}

function scrapeEpisode(episodeNum, url) {
  request(url, (err, response, html) => {
    if (!err) {
      console.log(`Successfully accessed ${url}`);
      let $ = cheerio.load(html);
      // select element containing the script
      let script = $('p font[size="-2"]').text();
      // save script to a file
      saveScript(episodeNum, script);
    }
    else {
      console.log(err);
    }
  });
}

function saveScript(id, script) {
  let fileName = `./seinfeld_raw_scripts/${id}.txt`;
  fs.writeFile(fileName, script, err => {
    if (!err) {
      console.log(`Episode ${id} file successfully written!`);
    }
    else {
      console.log(err);
    }
});
}

scrapeAllEpisodes(rootURL, baseURL);
console.log('Running Node.js scraping script');

