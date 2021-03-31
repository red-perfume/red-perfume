/* eslint-disable max-lines-per-function */

const cssStringify = require('@/css-stringify.js');

const testHelpers = require('@@/testHelpers.js');

describe('CSS stringify', () => {
  describe('Bad inputs', () => {
    test('Empty', () => {
      expect(cssStringify())
        .toEqual('');
    });

    test('Array', () => {
      expect(cssStringify([]))
        .toEqual('');
    });

    test('Number', () => {
      expect(cssStringify(4))
        .toEqual('');
    });

    test('Empty object', () => {
      expect(cssStringify({}))
        .toEqual('');
    });

    test('Stylesheet without rules', () => {
      expect(cssStringify({ stylesheet: {} }))
        .toEqual('');
    });
  });

  describe('Stringify AST', () => {
    test('0 rules', () => {
      const AST = {
        type: 'stylesheet',
        stylesheet: {
          rules: [],
          parsingErrors: []
        }
      };

      expect(cssStringify(AST))
        .toEqual('');
    });

    test('1 rule', () => {
      const AST = {
        type: 'stylesheet',
        stylesheet: {
          rules: [
            {
              type: 'rule',
              selectors: [
                [
                  '.test'
                ]
              ],
              declarations: [
                {
                  type: 'declaration',
                  property: 'background',
                  value: '#F00',
                  position: {
                    start: {
                      line: 1,
                      column: 9
                    },
                    end: {
                      line: 1,
                      column: 25
                    }
                  }
                }
              ],
              position: {
                start: {
                  line: 1,
                  column: 1
                },
                end: {
                  line: 1,
                  column: 28
                }
              }
            }
          ],
          parsingErrors: []
        }
      };

      expect(cssStringify(AST))
        .toEqual(testHelpers.trimIndentation(`
          .test {
            background: #F00;
          }
        `, 10));
    });

    test('2 rules', () => {
      const AST = {
        type: 'stylesheet',
        stylesheet: {
          rules: [
            {
              type: 'rule',
              selectors: [
                [
                  '.test'
                ]
              ],
              declarations: [
                {
                  type: 'declaration',
                  property: 'background',
                  value: '#F00',
                  position: {
                    start: {
                      line: 1,
                      column: 9
                    },
                    end: {
                      line: 1,
                      column: 25
                    }
                  }
                }
              ],
              position: {
                start: {
                  line: 1,
                  column: 1
                },
                end: {
                  line: 1,
                  column: 28
                }
              }
            },
            {
              type: 'rule',
              selectors: [
                [
                  '.example'
                ]
              ],
              declarations: [
                {
                  type: 'declaration',
                  property: 'margin',
                  value: '1px',
                  position: {
                    start: {
                      line: 1,
                      column: 40
                    },
                    end: {
                      line: 1,
                      column: 51
                    }
                  }
                }
              ],
              position: {
                start: {
                  line: 1,
                  column: 29
                },
                end: {
                  line: 1,
                  column: 54
                }
              }
            }
          ],
          parsingErrors: []
        }
      };

      expect(cssStringify(AST))
        .toEqual(testHelpers.trimIndentation(`
          .test {
            background: #F00;
          }
          .example {
            margin: 1px;
          }
        `, 10));
    });
  });
});
