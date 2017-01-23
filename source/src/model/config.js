let config = {
  "author": "liquidliang",
  "nav": [
    ["Home", "#!/index"],
    ["About", "#!/about"]
  ]
};

module.exports = {
  init: (c) => config=c,
  getConfig: ()=> config
};
