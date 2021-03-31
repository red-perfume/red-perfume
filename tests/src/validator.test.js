/* eslint-disable max-lines-per-function */

const mockfs = require('mock-fs');
const validator = require('@/validator.js');

const testHelpers = require('@@/testHelpers.js');

describe('Validator', () => {
  let options;

  beforeEach(() => {
    options = {
      verbose: true,
      customLogger: jest.fn()
    };
  });

  describe('validateArray', () => {
    test('Falsy', () => {
      expect(validator.validateArray(options, false, 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Non array', () => {
      expect(validator.validateArray(options, 'key', 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('message', undefined);
    });

    test('Array', () => {
      expect(validator.validateArray(options, ['key'], 'message'))
        .toEqual(['key']);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateBoolean', () => {
    test('undefined, true', () => {
      expect(validator.validateBoolean(undefined, true))
        .toEqual(true);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('undefined, false', () => {
      expect(validator.validateBoolean(undefined, false))
        .toEqual(false);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('falsy, true', () => {
      expect(validator.validateBoolean('', true))
        .toEqual(true);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('truthy, false', () => {
      expect(validator.validateBoolean('asdf', false))
        .toEqual(false);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('true, true', () => {
      expect(validator.validateBoolean(true, true))
        .toEqual(true);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('false, false', () => {
      expect(validator.validateBoolean(false, false))
        .toEqual(false);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('true, false', () => {
      expect(validator.validateBoolean(true, false))
        .toEqual(true);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('false, true', () => {
      expect(validator.validateBoolean(false, true))
        .toEqual(false);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateFile', () => {
    describe('extensions', () => {
      test('No extensions array', () => {
        expect(validator.validateFile(options, 'C:\\test', undefined, false))
          .toEqual('C:\\test');

        expect(options.customLogger)
          .not.toHaveBeenCalled();
      });

      test('No extension', () => {
        expect(validator.validateFile(options, 'C:\\test', [], false))
          .toEqual('C:\\test');

        expect(options.customLogger)
          .not.toHaveBeenCalled();
      });

      test('Does not contain extension', () => {
        expect(validator.validateFile(options, 'C:\\test', ['.fail'], false))
          .toEqual(undefined);

        expect(options.customLogger)
          .toHaveBeenCalledWith('Expected filepath (C:\\test) to end in .fail', undefined);
      });

      test('Does not contain either extension', () => {
        expect(validator.validateFile(options, 'C:\\test', ['.fail', '.notfound'], false))
          .toEqual(undefined);

        expect(options.customLogger)
          .toHaveBeenCalledWith('Expected filepath (C:\\test) to end in .fail or .notfound', undefined);
      });

      test('Does not contain any extensions', () => {
        expect(validator.validateFile(options, 'C:\\test', ['.fail', '.notfound', '.bad'], false))
          .toEqual(undefined);

        expect(options.customLogger)
          .toHaveBeenCalledWith('Expected filepath (C:\\test) to end in .fail, .notfound, or .bad', undefined);
      });

      test('Contains extension', () => {
        expect(validator.validateFile(options, 'C:\\test.sass', ['.css', '.scss', '.sass'], false))
          .toEqual('C:\\test.sass');

        expect(options.customLogger)
          .not.toHaveBeenCalled();
      });
    });

    describe('checkIfExists', () => {
      afterEach(() => {
        mockfs.restore();
      });

      test('File exists', () => {
        mockfs({
          'C:\\test\\file.css': '.text { background: #F00; }'
        });

        expect(validator.validateFile(options, 'C:\\test\\file.css', ['.css', '.scss', '.sass'], true))
          .toEqual('C:\\test\\file.css');

        expect(options.customLogger)
          .not.toHaveBeenCalled();
      });

      test('File does not exist', () => {
        mockfs({
          'C:\\test\\file.txt': 'text'
        });

        expect(validator.validateFile(options, 'C:\\test\\file.css', ['.css', '.scss', '.sass'], true))
          .toEqual(undefined);

        expect(options.customLogger)
          .toHaveBeenCalledWith('Could not find file: C:\\test\\file.css', undefined);
      });
    });
  });

  describe('validateFunction', () => {
    test('Falsy', () => {
      expect(validator.validateFunction(options, false, 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Not a function', () => {
      expect(validator.validateFunction(options, 'key', 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('message', undefined);
    });

    test('Function', () => {
      const fn = function () {};

      expect(validator.validateFunction(options, fn, 'message'))
        .toEqual(fn);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateObject', () => {
    test('Falsy', () => {
      expect(validator.validateObject(options, false, 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Non-object', () => {
      expect(validator.validateObject(options, 'key', 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('message', undefined);
    });

    test('Object', () => {
      const obj = {};

      expect(validator.validateObject(options, obj, 'message'))
        .toEqual(obj);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateString', () => {
    test('Falsy', () => {
      expect(validator.validateString(options, false, 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Non-string', () => {
      expect(validator.validateString(options, {}, 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('message', undefined);
    });

    test('String', () => {
      expect(validator.validateString(options, 'Test', 'message'))
        .toEqual('Test');

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateCustomLogger', () => {
    let consoleError;

    beforeEach(() => {
      consoleError = console.error;
      console.error = jest.fn();
    });

    afterEach(() => {
      console.error = consoleError;
      consoleError = undefined;
    });

    test('Falsy', () => {
      options.customLogger = false;

      expect(validator.validateCustomLogger(options).hasOwnProperty('customLogger'))
        .toEqual(false);

      expect(console.error)
        .not.toHaveBeenCalled();
    });

    test('Non-function', () => {
      options.customLogger = {};

      expect(validator.validateCustomLogger(options).hasOwnProperty('customLogger'))
        .toEqual(false);

      expect(console.error)
        .toHaveBeenCalledWith(testHelpers.trimIndentation(`
          _________________________
          Red-Perfume:
          Optional customLogger must be a type of function.
        `, 10), undefined);
    });

    test('Function', () => {
      expect(validator.validateCustomLogger(options).hasOwnProperty('customLogger'))
        .toEqual(true);

      expect(console.error)
        .not.toHaveBeenCalled();

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateTasks', () => {
    test('All tasks valid', () => {
      let result = jest.fn();
      options.tasks = [{
        styles: {
          data: '.a{margin:1px}',
          result
        }
      }];

      expect(validator.validateTasks(options))
        .toEqual({
          verbose: true,
          customLogger: options.customLogger,
          tasks: [{
            uglify: false,
            styles: {
              data: '.a{margin:1px}',
              result
            }
          }]
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateTask', () => {
    test('Empty object', () => {
      expect(validator.validateTask(options, {}))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Your task does not contain styles, markup, or scripts', undefined);
    });

    test('Uglify true', () => {
      expect(validator.validateTask(options, { uglify: true }))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Your task does not contain styles, markup, or scripts', undefined);
    });

    test('Styles, data, no result', () => {
      expect(validator.validateTask(options, { styles: { data: '.test { margin: 1px; }' } }))
        .toEqual({
          uglify: false,
          styles: {
            data: '.test { margin: 1px; }'
          }
        });

      expect(options.customLogger)
        .toHaveBeenCalledWith('Task did not contain a task.styles.out or a task.style.result', undefined);
    });

    test('Styles, data, result', () => {
      let result = jest.fn();

      expect(validator.validateTask(options, { styles: { data: '.test { margin: 1px; }', result } }))
        .toEqual({
          uglify: false,
          styles: {
            data: '.test { margin: 1px; }',
            result
          }
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Styles, data, out', () => {
      expect(validator.validateTask(options, { styles: { data: '.test { margin: 1px; }', out: 'C:\\file.css' } }))
        .toEqual({
          uglify: false,
          styles: {
            data: '.test { margin: 1px; }',
            out: 'C:\\file.css'
          }
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Markup, data, result', () => {
      let data = '<h1 class="test">Hi</h1>';
      let result = jest.fn();

      expect(validator.validateTask(options, { markup: [{ data, result }] }))
        .toEqual({
          uglify: false,
          markup: [{ data, result }]
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Each section is empty object', () => {
      expect(validator.validateTask(options, { styles: {}, markup: [], scripts: {} }))
        .toEqual({ uglify: false });

      expect(options.customLogger)
        .toHaveBeenCalledWith('Task did not contain a task.styles.in or a task.style.data', undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Task did not contain a task.styles.out or a task.style.result', undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Task did not contain a task.scripts.out or a task.scripts.result', undefined);
    });

    test('Each section is valid', () => {
      let task = {
        styles: {
          data: '.test { color: #F00; }',
          result: jest.fn()
        },
        markup: [
          {
            data: '<div class="test">Hi</div>',
            result: jest.fn()
          }
        ],
        scripts: {
          result: jest.fn()
        }
      };

      expect(validator.validateTask(options, task))
        .toEqual({ uglify: false, ...task });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateTaskStyles', () => {
    test('Empty object', () => {
      expect(validator.validateTaskStyles(options, {}))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Task did not contain a task.styles.in or a task.style.data', undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Task did not contain a task.styles.out or a task.style.result', undefined);
    });

    test('In and out', () => {
      mockfs({
        'C:\\app.css': '.app { background: #F00; }',
        'C:\\vendor.css': '.vendor { margin: 10px; }'
      });

      let styles = {
        in: [
          'C:\\app.css',
          'C:\\vendor.css'
        ],
        out: 'C:\\out.css'
      };

      expect(validator.validateTaskStyles(options, styles))
        .toEqual(styles);

      expect(options.customLogger)
        .not.toHaveBeenCalled();

      mockfs.restore();
    });
  });

  describe('validateTaskMarkup', () => {
    test('Empty array', () => {
      expect(validator.validateTaskMarkup(options, []))
        .toEqual(undefined);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Empty object', () => {
      expect(validator.validateTaskMarkup(options, [{}]))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Task did not contain a task.markup.in or a task.markup.data', undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Task did not contain a task.markup.out or a task.markup.result', undefined);
    });

    test('In out', () => {
      mockfs({
        'C:\\in.html': '<h1 class="test">Hi</h1>'
      });

      let markup = [{
        in: 'C:\\in.html',
        out: 'C:\\out.html'
      }];

      expect(validator.validateTaskMarkup(options, markup))
        .toEqual(markup);

      expect(options.customLogger)
        .not.toHaveBeenCalled();

      mockfs.restore();
    });
  });

  describe('validateTaskMarkupData', () => {
    test('Invalid HTML', () => {
      expect(validator.validateTaskMarkupData(options, 'Hi'))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Optional task.markup.data must be a string that begins with \'<\' or undefined.', undefined);
    });

    test('Valid HTML', () => {
      let data = '<div class="test">Hi</div>';

      expect(validator.validateTaskMarkupData(options, data))
        .toEqual(data);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateTaskScripts', () => {
    test('Empty', () => {
      expect(validator.validateTaskScripts(options, undefined))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Task did not contain a task.scripts.out or a task.scripts.result', undefined);
    });

    test('Empty object', () => {
      expect(validator.validateTaskScripts(options, {}))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Task did not contain a task.scripts.out or a task.scripts.result', undefined);
    });

    test('Out', () => {
      mockfs({
        'C:\\file.json': 'Text'
      });

      expect(validator.validateTaskScripts(options, { out: 'C:\\file.json' }))
        .toEqual({
          out: 'C:\\file.json'
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();

      mockfs.restore();
    });
  });

  describe('validateOptions', () => {
    test('No options', () => {
      let consoleError = console.error;
      console.error = jest.fn();
      let result = {
        verbose: true,
        tasks: []
      };

      expect(validator.validateOptions([]))
        .toEqual(result);

      expect(console.error)
        .toHaveBeenCalledWith(testHelpers.trimIndentation(`
          _________________________
          Red-Perfume:
          options.tasks Must be an array of objects. See documentation for details.
        `, 10), undefined);

      console.error = consoleError;
      consoleError = undefined;
    });

    test('No tasks', () => {
      let result = {
        verbose: true,
        customLogger: options.customLogger,
        tasks: []
      };

      expect(validator.validateOptions(options))
        .toEqual(result);

      expect(options.customLogger)
        .toHaveBeenCalledWith('options.tasks Must be an array of objects. See documentation for details.', undefined);
    });

    test('Empty tasks array', () => {
      options.tasks = [];
      let result = {
        verbose: true,
        customLogger: options.customLogger,
        tasks: []
      };

      expect(validator.validateOptions(options))
        .toEqual(result);

      expect(options.customLogger)
        .toHaveBeenCalledWith('options.tasks Must be an array of objects. See documentation for details.', undefined);
    });

    test('Tasks array empty object', () => {
      options.tasks = [{}];
      let result = {
        verbose: true,
        customLogger: options.customLogger,
        tasks: []
      };

      expect(validator.validateOptions(options))
        .toEqual(result);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Your task does not contain styles, markup, or scripts', undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('No valid tasks found.', undefined);
    });
  });
});
