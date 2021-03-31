/* eslint-disable max-lines-per-function */

const cssParser = require('@/css-parser.js');

describe('CSS parser', () => {
  let options;

  beforeEach(() => {
    options = {
      verbose: false,
      customLogger: jest.fn()
    };
  });

  describe('Bad inputs', () => {
    test('Empty', () => {
      expect(cssParser(options, undefined))
        .toEqual(undefined);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Empty string', () => {
      expect(cssParser(options, ''))
        .toEqual(undefined);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('HTML', () => {
      expect(cssParser(options, '<h1>Bad</h1>').stylesheet.parsingErrors.length)
        .toEqual(1);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('Parses string to AST', () => {
    test('One rule, one selector, one declaration', () => {
      expect(cssParser(options, '.test { color: #F00 }'))
        .toEqual({
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
                    property: 'color',
                    type: 'declaration',
                    value: '#F00'
                  }
                ]
              }
            ],
            source: undefined,
            parsingErrors: []
          }
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });
});
