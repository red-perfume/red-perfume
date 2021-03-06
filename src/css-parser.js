const css = require('css');
const selectorParse = require('css-what').parse;

const helpers = require('./helpers.js');

const cssParser = function (options, input) {
  if (!input) {
    helpers.throwError('Invalid CSS input.');
    return;
  }

  const parseOptions = {
    silent: !options.verbose,
    source: undefined
  };
  const parsed = css.parse(input, parseOptions);

  /*
    input = '.test { color: #F00 }';
    parsed = {
      type: 'stylesheet',
      stylesheet: {
        rules: [
          {
            type: 'rule',
            selectors: [
              [
                {
                  action: 'element',
                  ignoreCase: false,
                  name: 'class',
                  namespace: null,
                  original: '.test',
                  type: 'attribute',
                  value: 'test'
                }
              ]
            ],
            declarations: [
              {
                position: {...},
                property: 'color',
                type: 'declaration',
                value: '#F00'
              }
            ],
            position: {...}
          }
        ],
        source: undefined,
        parsingErrors: []
      }
    }
   */
  if (parsed && parsed.stylesheet && parsed.stylesheet.rules) {
    parsed.stylesheet.rules.forEach(function (rule) {
      let parsedSelectors = selectorParse(rule.selectors.join(','));
      for (let i = 0; i < parsedSelectors.length; i++) {
        parsedSelectors[i][0]['original'] = rule.selectors[i];
      }
      rule.selectors = parsedSelectors;
    });
  }

  return parsed;
};

module.exports = cssParser;
