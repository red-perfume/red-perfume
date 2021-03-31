const fs = require('fs');
const css = require('./css.js');
const html = require('./html.js');
const helpers = require('./helpers.js');

const atomize = {
  processStyles: function (options, task, processedStyles) {
    let styleData = '';
    let styleErrors = [];
    if (task.styles.in) {
      task.styles.in.forEach((file) => {
        try {
          styleData = styleData + String(fs.readFileSync(file));
        } catch (err) {
          helpers.throwError(options, 'Error reading style file: ' + file, err);
          styleErrors.push(err);
        }
      });
    }
    if (task.styles.data) {
      styleData = styleData + task.styles.data;
    }
    if (
      (task.styles.in && task.styles.in.length) ||
      task.styles.data
    ) {
      processedStyles = css(options, styleData, task.uglify);
    }
    if (task.styles.out) {
      try {
        fs.writeFileSync(task.styles.out, processedStyles.output + '\n');
      } catch (err) {
        helpers.throwError(options, 'Error writing CSS file: ' + task.styles.out, err);
        styleErrors.push(err);
      }
    }
    if (task.styles.result) {
      if (!styleErrors.length) {
        styleErrors = undefined;
      }
      task.styles.result(processedStyles.output, styleErrors);
    }
  },
  processMarkup: function (options, task, processedStyles) {
    task.markup.forEach((item) => {
      let processedMarkup;
      let markupData = '';
      let markupErrors = [];

      if (item.in) {
        try {
          markupData = markupData + String(fs.readFileSync(item.in));
        } catch (err) {
          helpers.throwError(options, 'Error reading markup file: ' + item.in, err);
          markupErrors.push(err);
        }
      }
      if (item.data) {
        markupData = markupData + item.data;
      }
      if (item.in || item.data) {
        processedMarkup = html(options, markupData, processedStyles.classMap);
      }
      if (item.out) {
        try {
          fs.writeFileSync(item.out, processedMarkup + '\n');
        } catch (err) {
          helpers.throwError(options, 'Error writing markup file: ' + item.out, err);
          markupErrors.push(err);
        }
      }
      if (item.result) {
        if (!markupErrors.length) {
          markupErrors = undefined;
        }
        item.result(processedMarkup, markupErrors);
      }
    });
  },
  processScripts: function (options, task, processedStyles) {
    let scriptErrors;
    if (task.scripts.out) {
      try {
        fs.writeFileSync(task.scripts.out, JSON.stringify(processedStyles.classMap, null, 2) + '\n');
      } catch (scriptErr) {
        helpers.throwError(options, 'Error writing script file: ' + task.scripts.out, scriptErr);
        scriptErrors = scriptErr;
      }
    }
    if (task.scripts.result) {
      task.scripts.result(processedStyles.classMap, scriptErrors);
    }
  },
  processTasks: function (options) {
    options.tasks.forEach((task) => {
      let processedStyles = {};
      if (task.styles) {
        this.processStyles(options, task, processedStyles);
      }
      if (task.markup) {
        this.processMarkup(options, task, processedStyles);
      }
      if (task.scripts) {
        this.processScripts(options, task, processedStyles);
      }
    });
  }
};

module.exports = atomize;
