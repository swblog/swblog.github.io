const createNGram = (n) => (str) => {
  let arr = [];
  let end = str.length - n + 1;
  for (var i = 0; i < end; i++) {
    arr.push(str.substr(i, n));
  }
  return arr;
}

const gramDict = {
  4: createNGram(4),
  3: createNGram(3),
  2: createNGram(2)
};

const getWordList = (str) => {
  let wordList = [str];
  let processStrict = (str) => str.replace(/['‘’][^'‘’]*['‘’]|["”“][^"”“]*["”“]/g, function($0) {
    wordList.push($0.replace(/['‘’"”“]/g, ''));
    return ' ';
  });


  let processChiese = (str) => str.replace(/[\u4e00-\u9fff\uf900-\ufaff]+/g, function($0) {
    wordList.push($0);
    for(var i = 4; i >1 ; i--){
      if($0.length > i){
        wordList.push.apply(wordList, gramDict[i]($0));
      }
    }
    return ' ';
  });

  let processEnglish = (str) => {
    wordList.push.apply(wordList, str.split(/\s+/).filter(o=>!!o));
  };

  processEnglish(processChiese(processStrict(str)));
  return wordList;
};

module.exports = {
  getWordList,
  getGlobalRegex: (str) => new RegExp(getWordList(str).join('|'), 'ig')
};
