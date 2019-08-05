const { Flagpole } = require('../dist/index.js');

const suite = Flagpole.Suite('Basic Smoke Test of Site')
   .base('https://www.google.com');

suite.html('Homepage Loads')
   .open('/')
   .next(function () {
      this.comment('asdfas');
   });
