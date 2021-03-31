/* eslint-disable max-lines-per-function */

const html = require('@/html.js');

describe('HTML', () => {
  let options;
  const errorResponse = '<html><head></head><body></body></html>';
  // const errorDocument = {
  //   childNodes: [],
  //   nodeName: '#document-fragment'
  // };

  beforeEach(() => {
    options = {
      verbose: true,
      customLogger: jest.fn()
    };
  });

  describe('Bad inputs', () => {
    test('Empty', () => {
      expect(html())
        .toEqual(errorResponse);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Just options', () => {
      expect(html(options))
        .toEqual(errorResponse);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Error parsing HTML', errorResponse);
    });

    test('Options, empty string', () => {
      expect(html(options, ''))
        .toEqual(errorResponse);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Error parsing HTML', errorResponse);
    });
  });

  describe('Process HTML', () => {
    test('Half comment', () => {
      expect(html(options, '><!--'))
        .toEqual('<html><head></head><body>&gt;<!----></body></html>');

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('One rule', () => {
      let classMap = {
        '.test': [
          '.rp__background__--COLON__--OCTOTHORPF00'
        ]
      };

      expect(html(options, '<!DOCTYPE html><html lang="en"><head></head><body><h1 class="test">Good</h1></body></html>', classMap))
        .toEqual('<!DOCTYPE html><html lang="en"><head></head><body><h1 class="rp__background__--COLON__--OCTOTHORPF00">Good</h1></body></html>');

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('One rule uglified', () => {
      let classMap = {
        '.test': [
          '.rp__0'
        ]
      };

      expect(html(options, '<!DOCTYPE html><html lang="en"><head></head><body><h1 class="test">Good</h1></body></html>', classMap))
        .toEqual('<!DOCTYPE html><html lang="en"><head></head><body><h1 class="rp__0">Good</h1></body></html>');

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Two rules, two properties', () => {
      let classMap = {
        '.test': [
          '.rp__background__--COLON__--OCTOTHORPF00',
          '.rp__width__--COLON100px'
        ],
        '.example': [
          '.rp__color__--COLON__--blue',
          '.rp__padding__--COLON__--20px'
        ]
      };

      expect(html(options, '<!DOCTYPE html><html lang="en"><head></head><body><h1 class="test example">Good</h1></body></html>', classMap))
        .toEqual([
          '<!DOCTYPE html>',
          '<html lang="en">',
          '<head>',
          '</head>',
          '<body>',
          '<h1 class="rp__background__--COLON__--OCTOTHORPF00 rp__width__--COLON100px rp__color__--COLON__--blue rp__padding__--COLON__--20px">',
          'Good',
          '</h1>',
          '</body>',
          '</html>'
        ].join(''));

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Two rules, two properties uglified', () => {
      let classMap = {
        '.test': [
          '.rp__0',
          '.rp__1'
        ],
        '.example': [
          '.rp__2',
          '.rp__3'
        ]
      };

      expect(html(options, '<!DOCTYPE html><html lang="en"><head></head><body><h1 class="test example">Good</h1></body></html>', classMap))
        .toEqual('<!DOCTYPE html><html lang="en"><head></head><body><h1 class="rp__0 rp__1 rp__2 rp__3">Good</h1></body></html>');

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('No matching classes in map', () => {
      let classMap = {
        '.test': [
          '.rp__background__--COLON__--OCTOTHORPF00'
        ]
      };

      expect(html(options, '<!DOCTYPE html><html lang="en"><head></head><body><h1 class="example">Good</h1></body></html>', classMap))
        .toEqual('<!DOCTYPE html><html lang="en"><head></head><body><h1 class="example">Good</h1></body></html>');

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });
});
