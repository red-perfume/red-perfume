module.exports = {
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaVersion': 2017
  },
  'env': {
    'es6': true,
    'node': true,
    'jest': true
  },
  'extends': [
    'plugin:jsdoc/recommended',
    'tjw-base',
    'tjw-jest'
  ],
  'plugins': [
    'jsdoc'
  ],
  'rules': {
    'max-lines-per-function': [
      'warn',
      {
        'max': 50,
        'skipBlankLines': true,
        'skipComments': true
      }
    ]
  },
  'settings': {
    'jsdoc': {
      'tagNamePreference': {
        'returns': 'return'
      }
    }
  }
};
