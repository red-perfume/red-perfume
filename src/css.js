const cssParser = require('./css-parser.js');
const cssStringify = require('./css-stringify.js');
const cssUglifier = require('./css-uglifier.js');
const encodeClassName = require('./css-class-encoding.js');
const helpers = require('./helpers.js');

/**
 * Rrecursively remove position. Parsed CSS contains position
 * data that is not of use for us and just clouds up the console
 * logs during development.
 *
 * @param  {any} item  Parsed CSS or a portion of it
 */
function recursivelyRemovePosition (item) {
  if (Array.isArray(item)) {
    item.forEach(function (subItem) {
      recursivelyRemovePosition(subItem);
    });
  }
  if (item && typeof(item) === 'object' && !Array.isArray(item)) {
    if (item.hasOwnProperty('position')) {
      delete item.position;
    }
    Object.keys(item).forEach(function (key) {
      recursivelyRemovePosition(item[key]);
    });
  }
}

/**
 * Remove duplicate property/value pairs that are duplicates.
 * `display: none; display: none;` becomes `display:none;`
 * `display: block; display: none;` is unchanged because they
 * are not identical.
 *
 * @param  {object} classMap  The class map object used by the HTML/JSON
 * @return {object}           Returns the classMap object
 */
function removeIdenticalProperties (classMap) {
  // Remove identical properties
  Object.keys(classMap).forEach(function (selector) {
    classMap[selector] = Array.from(new Set(classMap[selector].reverse())).reverse();
  });
  return classMap;
}

/**
 * Updates the map of selectors to their atomized classes.
 *
 * @param  {object} classMap          The class map object used by the HTML/JSON
 * @param  {Array}  selectors         Parsed CSS selectors
 * @param  {string} encodedClassName  Encoded class name
 * @return {object}                   Returns the classMap object
 */
function updateClassMap (classMap, selectors, encodedClassName) {
  /* A selector looks like:
    [{
      type: 'attribute',
      name: 'class',
      action: 'element',
      value: 'cow',
      ignoreCase: false,
      namespace: null,
      original: '.cow'
      }]
    */
  selectors.forEach(function (selector) {
    let originalSelectorName = selector[0].original;
    originalSelectorName = originalSelectorName.split(':')[0];

    classMap[originalSelectorName] = classMap[originalSelectorName] || [];
    classMap[originalSelectorName].push(encodedClassName.split(':')[0]);
  });
  return classMap;
}

/**
 * Ensure that non-classes are not atomized,
 * but still included in the output.
 *
 * @param  {object} rule     Parsed CSS Rule
 * @param  {object} newRules Object containing all unique rules
 */
function handleNonClasses (rule, newRules) {
  let originalSelectorName = rule.selectors[0][0].original;
  newRules[originalSelectorName] = {
    type: 'rule',
    selectors: [[originalSelectorName]],
    declarations: rule.declarations
  };
}

const css = function (options, input, uglify) {
  options = options || {};
  input = input || '';
  uglify = uglify || false;
  let parsed;
  try {
    parsed = cssParser(options, input);
  } catch (err) {
    helpers.throwError(options, 'Error parsing CSS', err);
  }
  if (!parsed) {
    helpers.throwError(options, 'Error parsing CSS', input);
    return {
      classMap: {},
      output: ''
    };
  }

  const output = {
    type: 'stylesheet',
    stylesheet: {
      rules: [],
      parsingErrors: []
    }
  };

  let classMap = {};
  const newRules = {};

  /* A rule looks like:
     {
       type: 'rule',
       selectors: [
         [
           {
             type: 'attribute',
             name: 'class',
             action: 'element',
             value: 'cow',
             ignoreCase: false,
             namespace: null,
             original: '.cow'
           }
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
               column: 8
             },
             end: {
               line: 1,
               column: 24
             }
           }
         },
         {
           type: 'declaration',
           property: 'border',
           value: 'none',
           position: {
             start: {
               line: 1,
               column: 26
             },
             end: {
               line: 1,
               column: 39
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
           column: 40
         }
       }
     }
  */
  parsed.stylesheet.rules.forEach(function (rule) {
    recursivelyRemovePosition(rule);
    // console.log(JSON.stringify(rule, null, 2));

    let type = rule.selectors[0][0].type;
    let name = rule.selectors[0][0].name;
    if (type === 'tag' || (type === 'attribute' && name !== 'class')) {
      handleNonClasses(rule, newRules);
    } else {
      /* A declaration looks like:
        {
          type: 'declaration',
          property: 'padding',
          value: '10px',
          position: Position {
            start: { line: 1, column: 48 },
            end: { line: 1, column: 61 },
            source: undefined
          }
        }
      */
      rule.declarations.forEach(function (declaration) {
        /* An encoded class name look like:
          .rp__padding__--COLON10px
        */
        let encodedClassName = encodeClassName(options, declaration);

        if (rule.selectors[0][1] && rule.selectors[0][1].type && rule.selectors[0][1].type === 'pseudo') {
          let pseudoName = rule.selectors[0][1].name;
          // .rp__display__--COLONblock___-HOVER:hover
          let pseudoClassName = encodedClassName + '___-' + pseudoName.toUpperCase() + ':' + pseudoName;
          encodedClassName = pseudoClassName;
        }

        classMap = updateClassMap(classMap, rule.selectors, encodedClassName);

        newRules[encodedClassName] = {
          type: 'rule',
          selectors: [[encodedClassName]],
          declarations: [declaration]
        };
      });
    }
  });

  recursivelyRemovePosition(newRules);
  // console.log(JSON.stringify(newRules, null, 2));
  classMap = removeIdenticalProperties(classMap);

  if (uglify) {
    let index = 0;
    Object.keys(newRules).forEach(function (key) {
      if (key.startsWith('.')) {
        let pseudo = '';
        if (key.includes(':')) {
          let split = key.split(':');
          split.shift(0);
          pseudo = ':' + split.join(':');
        }
        let result = cssUglifier(index);

        index = result.index;

        let uglifiedName = result.name + pseudo;
        newRules[uglifiedName] = newRules[key];
        newRules[uglifiedName].selectors[0][0] = uglifiedName;
        delete newRules[key];

        Object.keys(classMap).forEach(function (mapKey) {
          key = key.split(':')[0];
          let indexOfKey = classMap[mapKey].indexOf(key);
          if (indexOfKey !== -1) {
            classMap[mapKey][indexOfKey] = result.name;
          }
        });
      }
    });
  }

  Object.keys(newRules).forEach(function (key) {
    output.stylesheet.rules.push(newRules[key]);
  });

  return {
    // classMap: { '.cow': [ '.rp__0', '.rp__1' ], '.moo': [ '.rp__2', '.rp__1' ] }
    classMap,
    /*
      '.rp__0 { background: #F00; }' +
      '.rp__1 { border: none; }' +
      '.rp__2 { padding: 10px; }'
    */
    output: cssStringify(output)
  };
};

css.removeIdenticalProperties = removeIdenticalProperties;
module.exports = css;
