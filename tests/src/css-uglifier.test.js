/* eslint-disable max-lines-per-function */

const cssUglifier = require('@/css-uglifier.js');

describe('Class encoding', () => {
  describe('Bad inputs', () => {
    test('Empty', () => {
      expect(cssUglifier())
        .toEqual({
          name: '.rp__0',
          index: 1
        });
    });

    test('Array', () => {
      expect(cssUglifier([]))
        .toEqual({
          name: '.rp__0',
          index: 1
        });
    });

    test('String', () => {
      expect(cssUglifier('4'))
        .toEqual({
          name: '.rp__0',
          index: 1
        });
    });

    test('Empty object', () => {
      expect(cssUglifier({}))
        .toEqual({
          name: '.rp__0',
          index: 1
        });
    });
  });

  describe('Uglify', () => {
    test('Specific index', () => {
      expect(cssUglifier(4))
        .toEqual({
          name: '.rp__4',
          index: 5
        });
    });

    test('Base 36 encoding', () => {
      // parseInt('z', 36) = 35
      expect(cssUglifier(35))
        .toEqual({
          name: '.rp__z',
          index: 36 // 10
        });
    });

    test('Skip known bad', () => {
      // parseInt('ad0', 36) = 13428
      expect(cssUglifier(13428))
        .toEqual({
          name: '.rp__ae0',
          index: 13465 // ae1
        });
    });
  });
});
