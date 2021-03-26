require('./sourcemap-register.js');module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 932:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(186);
const parseChangelog = __nccwpck_require__(352);
const compareVersions = __nccwpck_require__(296);

// most @actions toolkit packages have async methods
async function run() {
  try {
    const lastVersion = core.getInput('lastVersion');
    const changelogPath = core.getInput('changelogPath');
    const changelog = await parseChangelog(changelogPath);
    let changes = '';
    if (lastVersion === 'latest') {
      changes = changelog.versions[0].body;
    } else {
      if (compareVersions.validate(lastVersion)) {
        core.setFailed(`lastVersion ${lastVersion} do no follow semver`);
      }
      changelog.versions.forEach((version) => {
        if (compareVersions.validate(version.version)) {
          core.setFailed(`version ${version.version} do no follow semver`);
        }
        if (compareVersions.compare(lastVersion, version.version, '>')) {
          if (changes !== '') {
            changes += "\n";
          }
          changes += version.body;
        }
      });
    }

    core.info(changes);

    core.setOutput('lastChanges', changes);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();


/***/ }),

/***/ 351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __nccwpck_require__(351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(278);
const os = __importStar(__nccwpck_require__(87));
const path = __importStar(__nccwpck_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(747));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 352:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var EOL = __nccwpck_require__(87).EOL
var lineReader = __nccwpck_require__(159)
var removeMarkdown = __nccwpck_require__(163)

// patterns
var semver = /\[?v?([\w\d.-]+\.[\w\d.-]+[a-zA-Z0-9])\]?/
var date = /.*[ ](\d\d?\d?\d?[-/.]\d\d?[-/.]\d\d?\d?\d?).*/
var subhead = /^###/
var listitem = /^[*-]/

var defaultOptions = { removeMarkdown: true }

/**
 * Changelog parser.
 *
 * @param {string|object} options - changelog file string or options object containing file string
 * @param {string} [options.filePath] - path to changelog file
 * @param {string} [options.text] - changelog text (filePath alternative)
 * @param {boolean} [options.removeMarkdown=true] - changelog file string to parse
 * @param {function} [callback] - optional callback
 * @returns {Promise<object>} - parsed changelog object
 */
function parseChangelog (options, callback) {
  if (typeof options === 'undefined') throw new Error('missing options argument')
  if (typeof options === 'string') options = { filePath: options }
  if (typeof options === 'object') {
    var hasFilePath = typeof options.filePath !== 'undefined'
    var hasText = typeof options.text !== 'undefined'
    var invalidFilePath = typeof options.filePath !== 'string'
    var invalidText = typeof options.text !== 'string'

    if (!hasFilePath && !hasText) {
      throw new Error('must provide filePath or text')
    }

    if (hasFilePath && invalidFilePath) {
      throw new Error('invalid filePath, expected string')
    }

    if (hasText && invalidText) {
      throw new Error('invalid text, expected string')
    }
  }

  var opts = Object.assign({}, defaultOptions, options)
  var changelog = parse(opts)

  if (typeof callback === 'function') {
    changelog
      .then(function (log) { callback(null, log) })
      .catch(function (err) { callback(err) })
  }

  // otherwise, invoke callback
  return changelog
}

/**
 * Internal parsing logic.
 *
 * @param {options} options - options object
 * @param {string} [options.filePath] - path to changelog file
 * @param {string} [options.text] - changelog text (filePath alternative)
 * @param {boolean} [options.removeMarkdown] - remove markdown
 * @returns {Promise<object>} - parsed changelog object
 */
function parse (options) {
  var filePath = options.filePath
  var text = options.text
  var data = {
    log: { versions: [] },
    current: null
  }

  // allow `handleLine` to mutate log/current data as `this`.
  var cb = handleLine.bind(data, options)

  return new Promise(function (resolve, reject) {
    function done () {
      // push last version into log
      if (data.current) {
        pushCurrent(data)
      }

      // clean up description
      data.log.description = clean(data.log.description)
      if (data.log.description === '') delete data.log.description

      resolve(data.log)
    }

    if (text) {
      text.split(/\r\n?|\n/mg).forEach(cb)
      done()
    } else {
      lineReader.eachLine(filePath, cb, EOL).then(done)
    }
  })
}

/**
 * Handles each line and mutates data object (bound to `this`) as needed.
 *
 * @param {object} options - options object
 * @param {boolean} options.removeMarkdown - whether or not to remove markdown
 * @param {string} line - line from changelog file
 */
function handleLine (options, line) {
  // skip line if it's a link label
  if (line.match(/^\[[^[\]]*\] *?:/)) return

  // set title if it's there
  if (!this.log.title && line.match(/^# ?[^#]/)) {
    this.log.title = line.substring(1).trim()
    return
  }

  // new version found!
  if (line.match(/^##? ?[^#]/)) {
    if (this.current && this.current.title) pushCurrent(this)

    this.current = versionFactory()

    if (semver.exec(line)) this.current.version = semver.exec(line)[1]

    this.current.title = line.substring(2).trim()

    if (this.current.title && date.exec(this.current.title)) this.current.date = date.exec(this.current.title)[1]

    return
  }

  // deal with body or description content
  if (this.current) {
    this.current.body += line + EOL

    // handle case where current line is a 'subhead':
    // - 'handleize' subhead.
    // - add subhead to 'parsed' data if not already present.
    if (subhead.exec(line)) {
      var key = line.replace('###', '').trim()

      if (!this.current.parsed[key]) {
        this.current.parsed[key] = []
        this.current._private.activeSubhead = key
      }
    }

    // handle case where current line is a 'list item':
    if (listitem.exec(line)) {
      const log = options.removeMarkdown ? removeMarkdown(line) : line
      // add line to 'catch all' array
      this.current.parsed._.push(log)

      // add line to 'active subhead' if applicable (eg. 'Added', 'Changed', etc.)
      if (this.current._private.activeSubhead) {
        this.current.parsed[this.current._private.activeSubhead].push(log)
      }
    }
  } else {
    this.log.description = (this.log.description || '') + line + EOL
  }
}

function versionFactory () {
  return {
    version: null,
    title: null,
    date: null,
    body: '',
    parsed: {
      _: []
    },
    _private: {
      activeSubhead: null
    }
  }
}

function pushCurrent (data) {
  // remove private properties
  delete data.current._private

  data.current.body = clean(data.current.body)
  data.log.versions.push(data.current)
}

function clean (str) {
  if (!str) return ''

  // trim
  str = str.trim()
  // remove leading newlines
  str = str.replace(new RegExp('[' + EOL + ']*'), '')
  // remove trailing newlines
  str = str.replace(new RegExp('[' + EOL + ']*$'), '')

  return str
}

module.exports = parseChangelog


/***/ }),

/***/ 296:
/***/ (function(module) {

/* global define */
(function (root, factory) {
  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (true) {
    module.exports = factory();
  } else {}
}(this, function () {

  var semver = /^v?(?:\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+))?(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i;

  function indexOrEnd(str, q) {
    return str.indexOf(q) === -1 ? str.length : str.indexOf(q);
  }

  function split(v) {
    var c = v.replace(/^v/, '').replace(/\+.*$/, '');
    var patchIndex = indexOrEnd(c, '-');
    var arr = c.substring(0, patchIndex).split('.');
    arr.push(c.substring(patchIndex + 1));
    return arr;
  }

  function tryParse(v) {
    return isNaN(Number(v)) ? v : Number(v);
  }

  function validate(version) {
    if (typeof version !== 'string') {
      throw new TypeError('Invalid argument expected string');
    }
    if (!semver.test(version)) {
      throw new Error('Invalid argument not valid semver (\''+version+'\' received)');
    }
  }

  function compareVersions(v1, v2) {
    [v1, v2].forEach(validate);

    var s1 = split(v1);
    var s2 = split(v2);

    for (var i = 0; i < Math.max(s1.length - 1, s2.length - 1); i++) {
      var n1 = parseInt(s1[i] || 0, 10);
      var n2 = parseInt(s2[i] || 0, 10);

      if (n1 > n2) return 1;
      if (n2 > n1) return -1;
    }

    var sp1 = s1[s1.length - 1];
    var sp2 = s2[s2.length - 1];

    if (sp1 && sp2) {
      var p1 = sp1.split('.').map(tryParse);
      var p2 = sp2.split('.').map(tryParse);

      for (i = 0; i < Math.max(p1.length, p2.length); i++) {
        if (p1[i] === undefined || typeof p2[i] === 'string' && typeof p1[i] === 'number') return -1;
        if (p2[i] === undefined || typeof p1[i] === 'string' && typeof p2[i] === 'number') return 1;

        if (p1[i] > p2[i]) return 1;
        if (p2[i] > p1[i]) return -1;
      }
    } else if (sp1 || sp2) {
      return sp1 ? -1 : 1;
    }

    return 0;
  };

  var allowedOperators = [
    '>',
    '>=',
    '=',
    '<',
    '<='
  ];

  var operatorResMap = {
    '>': [1],
    '>=': [0, 1],
    '=': [0],
    '<=': [-1, 0],
    '<': [-1]
  };

  function validateOperator(op) {
    if (typeof op !== 'string') {
      throw new TypeError('Invalid operator type, expected string but got ' + typeof op);
    }
    if (allowedOperators.indexOf(op) === -1) {
      throw new TypeError('Invalid operator, expected one of ' + allowedOperators.join('|'));
    }
  }

  compareVersions.validate = function(version) {
    return typeof version === 'string' && semver.test(version);
  }

  compareVersions.compare = function (v1, v2, operator) {
    // Validate operator
    validateOperator(operator);

    // since result of compareVersions can only be -1 or 0 or 1
    // a simple map can be used to replace switch
    var res = compareVersions(v1, v2);
    return operatorResMap[operator].indexOf(res) > -1;
  }

  return compareVersions;
}));


/***/ }),

/***/ 159:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

(function() {
  "use strict";

  var fs = __nccwpck_require__(747),
      StringDecoder = __nccwpck_require__(304).StringDecoder;

  function LineReader(fd, cb, separator, encoding, bufferSize) {
    var filePosition   = 0,
        encoding       = encoding || 'utf8',
        separator      = separator || '\n',
        bufferSize     = bufferSize || 1024,
        buffer         = new Buffer(bufferSize),
        bufferStr      = '',
        decoder        = new StringDecoder(encoding),
        closed         = false,
        eof            = false,
        separatorIndex = -1;

    function close() {
      if (!closed) {
        fs.close(fd, function(err) {
          if (err) {
            throw err;
          }
        });
        closed = true;
      }
    }

    function readToSeparator(cb) {
      function readChunk() {
        fs.read(fd, buffer, 0, bufferSize, filePosition, function(err, bytesRead) {
          var separatorAtEnd;

          if (err) {
            throw err;
          }

          if (bytesRead < bufferSize) {
            eof = true;
            close();
          }

          filePosition += bytesRead;

          bufferStr += decoder.write(buffer.slice(0, bytesRead));

          if (separatorIndex < 0) {
            separatorIndex = bufferStr.indexOf(separator);
          }

          separatorAtEnd = separatorIndex === bufferStr.length - 1;
          if (bytesRead && (separatorIndex === -1 || separatorAtEnd) && !eof) {
            readChunk();
          } else {
            cb();
          }
        });
      }

      readChunk();
    }

    function hasNextLine() {
      return bufferStr.length > 0 || !eof;
    }

    function nextLine(cb) {
      function getLine() {
        var ret = bufferStr.substring(0, separatorIndex);

        bufferStr = bufferStr.substring(separatorIndex + separator.length);
        separatorIndex = -1;
        cb(ret);
      }

      if (separatorIndex < 0) {
        separatorIndex = bufferStr.indexOf(separator);
      }

      if (separatorIndex < 0) {
        if (eof) {
          if (hasNextLine()) {
            separatorIndex = bufferStr.length;
            getLine();
          } else {
            throw new Error('No more lines to read.');
          }
        } else {
          readToSeparator(getLine);
        }
      } else {
        getLine();
      }
    }

    this.hasNextLine = hasNextLine;
    this.nextLine = nextLine;
    this.close = close;

    readToSeparator(cb);
  }

  function open(filename, cb, separator, encoding, bufferSize) {
    fs.open(filename, 'r', parseInt('666', 8), function(err, fd) {
      var reader;
      if (err) {
        throw err;
      }

      reader = new LineReader(fd, function() {
        cb(reader);
      }, separator, encoding, bufferSize);
    });
  }

  function eachLine(filename, cb, separator, encoding, bufferSize) {
    var finalFn,
        asyncCb = cb.length == 3;

    function finish() {
      if (finalFn && typeof finalFn === 'function') {
        finalFn();
      }
    }

    open(filename, function(reader) {
      function newRead() {
        if (reader.hasNextLine()) {
          setImmediate(readNext);
        } else {
          finish();
        }
      }

      function continueCb(continueReading) {
        if (continueReading !== false) {
          newRead();
        } else {
          finish();
          reader.close();
        }
      }

      function readNext() {
        reader.nextLine(function(line) {
          var last = !reader.hasNextLine();

          if (asyncCb) {
            cb(line, last, continueCb);
          } else {
            if (cb(line, last) !== false) {
              newRead();
            } else {
              finish();
              reader.close();
            }
          }
        });
      }

      newRead();
    }, separator, encoding, bufferSize);

    return {
      then: function(cb) {
        finalFn = cb;
      }
    };
  }

  module.exports.open = open;
  module.exports.eachLine = eachLine;
}());


/***/ }),

/***/ 163:
/***/ ((module) => {

module.exports = function(md, options) {
  options = options || {};
  options.listUnicodeChar = options.hasOwnProperty('listUnicodeChar') ? options.listUnicodeChar : false;
  options.stripListLeaders = options.hasOwnProperty('stripListLeaders') ? options.stripListLeaders : true;
  options.gfm = options.hasOwnProperty('gfm') ? options.gfm : true;

  var output = md || '';

  // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
  output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*$/gm, '');

  try {
    if (options.stripListLeaders) {
      if (options.listUnicodeChar)
        output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, options.listUnicodeChar + ' $1');
      else
        output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, '$1');
    }
    if (options.gfm) {
      output = output
        // Header
        .replace(/\n={2,}/g, '\n')
        // Strikethrough
        .replace(/~~/g, '')
        // Fenced codeblocks
        .replace(/`{3}.*\n/g, '');
    }
    output = output
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove setext-style headers
      .replace(/^[=\-]{2,}\s*$/g, '')
      // Remove footnotes?
      .replace(/\[\^.+?\](\: .*?$)?/g, '')
      .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
      // Remove images
      .replace(/\!\[.*?\][\[\(].*?[\]\)]/g, '')
      // Remove inline links
      .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')
      // Remove blockquotes
      .replace(/^\s{0,3}>\s?/g, '')
      // Remove reference-style links?
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
      // Remove atx-style headers
      .replace(/^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm, '$1$2$3')
      // Remove emphasis (repeat the line to remove double emphasis)
      .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
      .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
      // Remove code blocks
      .replace(/(`{3,})(.*?)\1/gm, '$2')
      // Remove inline code
      .replace(/`(.+?)`/g, '$1')
      // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
      .replace(/\n{2,}/g, '\n\n');
  } catch(e) {
    console.error(e);
    return md;
  }
  return output;
};


/***/ }),

/***/ 747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),

/***/ 87:
/***/ ((module) => {

"use strict";
module.exports = require("os");;

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ }),

/***/ 304:
/***/ ((module) => {

"use strict";
module.exports = require("string_decoder");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__nccwpck_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __nccwpck_require__(932);
/******/ })()
;
//# sourceMappingURL=index.js.map