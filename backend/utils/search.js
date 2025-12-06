// backend/utils/search.js
const Fuse = require('fuse.js');

function createFuseIndex(list) {
  const options = {
    keys: ['title', 'summary', 'category', 'steps'],
    threshold: 0.35,
    includeScore: true,
    ignoreLocation: true
  };
  return new Fuse(list, options);
}

module.exports = { createFuseIndex };
