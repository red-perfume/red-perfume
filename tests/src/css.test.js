/* eslint-disable max-lines-per-function */

const css = require('@/css.js');

const testHelpers = require('@@/testHelpers.js');

describe('CSS', () => {
  let options;
  const errorResponse = {
    classMap: {},
    output: ''
  };

  beforeEach(() => {
    options = {
      verbose: true,
      customLogger: jest.fn()
    };
  });

  describe('removeIdenticalProperties', () => {
    test('Removes dupes', () => {
      expect(css.removeIdenticalProperties({
        '.duplicates': [
          '.rp__display__--COLONnone',
          '.rp__display__--COLONblock',
          '.rp__display__--COLONnone',
          '.rp__display__--COLONinline-block',
          '.rp__display__--COLONnone',
          '.rp__display__--COLONflex'
        ]
      }))
        .toEqual({
          '.duplicates': [
            '.rp__display__--COLONblock',
            '.rp__display__--COLONinline-block',
            '.rp__display__--COLONnone',
            '.rp__display__--COLONflex'
          ]
        });
    });
  });

  describe('Bad inputs', () => {
    test('Empty', () => {
      expect(css())
        .toEqual(errorResponse);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Just options', () => {
      expect(css(options))
        .toEqual(errorResponse);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Error parsing CSS', '');
    });

    test('Options, empty string', () => {
      expect(css(options, ''))
        .toEqual(errorResponse);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Error parsing CSS', '');
    });

    test('Options, HTML', () => {
      expect(css(options, '<h1>Bad</h1>'))
        .toEqual(errorResponse);

      let firstError = options.customLogger.mock.calls[0];
      let secondError = options.customLogger.mock.calls[1];

      expect(JSON.stringify(firstError))
        .toEqual('["Error parsing CSS",{"reason":"missing \'{\'","line":1,"column":13,"source":""}]');

      expect(secondError)
        .toEqual(['Error parsing CSS', '<h1>Bad</h1>']);
    });
  });

  describe('Process CSS', () => {
    test('One rule', () => {
      let output = testHelpers.trimIndentation(`
        .rp__background__--COLON__--OCTOTHORPF00 {
          background: #F00;
        }
      `, 8);

      expect(css(options, '.test { background: #F00; }', false))
        .toEqual({
          classMap: {
            '.test': [
              '.rp__background__--COLON__--OCTOTHORPF00'
            ]
          },
          output
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('One rule uglified', () => {
      let output = testHelpers.trimIndentation(`
        .rp__0 {
          background: #F00;
        }
      `, 8);

      expect(css(options, '.test { background: #F00; }', true))
        .toEqual({
          classMap: {
            '.test': [
              '.rp__0'
            ]
          },
          output
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Handle non-classes', () => {
      let input = `
        h1 {
          background: #F00;
          border: 1px solid #00F;
        }
        [attr] {
          text-transform: small-caps;
          overflow: hidden;
        }
        [attr="123"] {
          position: absolute;
          border-radius: 2px;
        }
        .example {
          display: block;
          text-align: center
        }
        #specificity-overkill {
          color: #FF0;
          z-index: 2;
        }
      `;

      expect(css(options, input, false).output)
        .toEqual(testHelpers.trimIndentation(`
          h1 {
            background: #F00;
            border: 1px solid #00F;
          }
          [attr] {
            text-transform: small-caps;
            overflow: hidden;
          }
          [attr="123"] {
            position: absolute;
            border-radius: 2px;
          }
          .rp__display__--COLONblock {
            display: block;
          }
          .rp__text-align__--COLONcenter {
            text-align: center;
          }
          #specificity-overkill {
            color: #FF0;
            z-index: 2;
          }
        `, 10));

      expect(css(options, input, true).output)
        .toEqual(testHelpers.trimIndentation(`
          h1 {
            background: #F00;
            border: 1px solid #00F;
          }
          [attr] {
            text-transform: small-caps;
            overflow: hidden;
          }
          [attr="123"] {
            position: absolute;
            border-radius: 2px;
          }
          #specificity-overkill {
            color: #FF0;
            z-index: 2;
          }
          .rp__0 {
            display: block;
          }
          .rp__1 {
            text-align: center;
          }
        `, 10));
    });

    test('Handle pseudo-classes', () => {
      let input = `
        .example {
          display: inline-block;
          text-align: right;
        }
        .example:hover {
          display: block;
          text-align: center
        }
        .example:active {
          color: #F00;
        }
        .example:visited {
          color: #00F;
        }
        h1:hover {
          color: #F00;
        }
        .cow {
          background: #F00;
          color: #00F;
        }
        .cow:hover {
          background: #0F0;
        }
      `;

      expect(css(options, input, false).output)
        .toEqual(testHelpers.trimIndentation(`
          .rp__display__--COLONinline-block {
            display: inline-block;
          }
          .rp__text-align__--COLONright {
            text-align: right;
          }
          .rp__display__--COLONblock___-HOVER:hover {
            display: block;
          }
          .rp__text-align__--COLONcenter___-HOVER:hover {
            text-align: center;
          }
          .rp__color__--COLON__--OCTOTHORPF00___-ACTIVE:active {
            color: #F00;
          }
          .rp__color__--COLON__--OCTOTHORP00F___-VISITED:visited {
            color: #00F;
          }
          h1:hover {
            color: #F00;
          }
          .rp__background__--COLON__--OCTOTHORPF00 {
            background: #F00;
          }
          .rp__color__--COLON__--OCTOTHORP00F {
            color: #00F;
          }
          .rp__background__--COLON__--OCTOTHORP0F0___-HOVER:hover {
            background: #0F0;
          }
        `, 10));

      expect(css(options, input, true).output)
        .toEqual(testHelpers.trimIndentation(`
          h1:hover {
            color: #F00;
          }
          .rp__0 {
            display: inline-block;
          }
          .rp__1 {
            text-align: right;
          }
          .rp__2:hover {
            display: block;
          }
          .rp__3:hover {
            text-align: center;
          }
          .rp__4:active {
            color: #F00;
          }
          .rp__5:visited {
            color: #00F;
          }
          .rp__6 {
            background: #F00;
          }
          .rp__7 {
            color: #00F;
          }
          .rp__8:hover {
            background: #0F0;
          }
        `, 10));
    });

    test('Handle qualifying elements', () => {
      let input = `
        h1.example {
          display: block;
          text-align: center;
        }
      `;

      expect(css(options, input, false).output)
        .toEqual(testHelpers.trimIndentation(`
          h1.rp__display__--COLONblock {
            display: block;
          }
          h1.rp__text-align__--COLONcenter {
            text-align: center;
          }
        `, 10));

      expect(css(options, input, true).output)
        .toEqual(testHelpers.trimIndentation(`
          h1.rp__0 {
            display: block;
          }
          h1.rp__1 {
            text-align: center;
          }
        `, 10));
    });
  });
});
