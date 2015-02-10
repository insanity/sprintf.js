/* sprintf based on ISO C & XSI extensions, alexei extensions (ext_spec) */
var sprintf = function () {
  var extended = sprintf.options.enable_extensions;
  var key = arguments[0], cache = sprintf.cache;
  if (!cache[extended][key]) {
    cache[extended][key] = sprintf.parse(key);
  }
  return sprintf.format(cache[extended][key], arguments);
};

sprintf.cache = {true: {}, false: {}};

sprintf.options = {
  enable_extensions: true,
};

sprintf.parse = function (template_string) {
  var extended = sprintf.options.enable_extensions;
  var starting_rule = extended ? "AConversionTemplate" : "ConversionTemplate";
  return prepare(sprintf.parser.parse(template_string, { startRule: starting_rule }));
};

sprintf.format = function (tree, args) {
  var template = tree.template, arg, ret = "", str="", cursor = 1, i, pad_char, len, root;
  if (tree.required > args.length - 1) {
    throw new Error(sprintf("[sprintf] %d arguments are required, but got only %d", tree.required, args.length - 1));
  }
  if (tree.required < args.length - 1) {
    console && console.warn && console.warn(sprintf("[sprintf] %d arguments are required, but got %d", tree.required, args.length - 1));
  }
  for (i = 0; i < template.length; i++) {
    var segment = template[i];
    if (!segment.type) { // string
      ret += segment;
    } else if (segment.type === "spec" || segment.type === "ext_spec") {
      if (segment.position === null) {
        arg = args[cursor]; // determined by order
        cursor++;
      } else if (segment.type === "ext_spec" && segment.position.type == "Member") {
        arg = defer_chain(args[1][segment.position.identifier.name], args[1], segment.position.chain);
      } else { // integer
        arg = args[segment.position]; // positional
      }
      if (specifier_argument_numeric(segment.specifier)) {
        arg = 1 * arg; // convert to number
      } else {
        arg = "" + arg; // convert to string
      }

      switch (segment.specifier) {
        case "b":
          str = format_integer(arg, 2, segment);
        break;
        case "c":
          str = String.fromCharCode(arg);
        break;
        case "d":
        case "i":
          str = format_integer(arg, 10, segment)
        break;
        case "e":
        case "E":
          str = format_float(arg, segment, true);
        break;
        case "f":
        case "F":
          str = format_float(arg, segment, false);
        break;
        case "o":
          str = format_integer(arg, 8, segment);
        break;
        case "s":
          str = (segment.precision === null) ? arg : arg.substring(0, segment.precision);
        break;
        case "u":
          str = format_integer(arg >>> 0, 10, segment)
        break;
        case "x":
        case "X":
          str = format_integer(arg, 16, segment);
        break;
        default:
          throw sprintf("conversion specifier \"%%%s\"is not supported", segment.specifier);
      }
      if (specifier_uppercase(segment.specifier)) {
        str = str.toUpperCase();
      }
      pad_char = (segment.type === "ext_spec" && segment.flags["'"]) ? segment.flags["'"] :
                 (segment.specifier === "s" && segment.flags["0"]) ? "0" : " ";
      len = segment.min - str.length;
      str = pad(str, pad_char, len, segment.flags["-"]);
      ret += str;
    }
  }
  return ret;
};

var vsprintf = function(fmt, argv, _argv) {
    _argv = (argv || []).slice(0)
    _argv.splice(0, 0, fmt)
    return sprintf.apply(null, _argv)
};

var prepare = function (template) {
  var args_required = 0, cursor = 1, i, segment;
  for (i = 0; i < template.length; i++) {
    segment = template[i];
    if (segment.type === "spec" || segment.type === "ext_spec") {
      if (segment.position === null) {
        segment.position = cursor;
        cursor++;
      } else if (segment.type === "ext_spec" && segment.position.type == "Member") {
        args_required = Math.max(1, args_required);
      } else { // integer
        args_required = Math.max(segment.position, args_required);
      }
      if (segment.flags === null) {
        segment.flags = {"'": false, "#": false, "0": false, " ": false, "+": false, "-": false};
      }
      if (segment.min === null) {
        segment.min = 0;
      }
      if (segment.precision === null) {
        segment.precision = (specifier_float(segment.specifier)) ? 6 : null;
      }
    }
  }
  args_required = Math.max(cursor - 1, args_required);
  return { template: template, required: args_required };
};

var pad = function (str, pad_char, len, pad_right) {
  var padding;
  if (len > 0) {
    padding = str_repeat(pad_char, len);
    str = pad_right ? str + padding : padding + str;
  }
  return str;
};
var specifier_uppercase = function (s) {
  return ("FEGAX".indexOf(s) !== -1);
};
var specifier_argument_numeric = function (s) {
  return ("bcdiouxXfFeEgGaA".indexOf(s) !== -1);
};
var specifier_integer = function (s) {
  return ("bdiouxX".indexOf(s) !== -1);
};
var specifier_float = function (s) {
  return ("fFeEgGaA".indexOf(s) !== -1);
};

var str_repeat = function (ch, len) {
  var ret = "", i;
  for (i = 0; i < len; i++) {
    ret += ch;
  }
  return ret;
};

var prepend_sign_symbol = function (str, num, options) {
  return (num < 0) ? "-" + str :
         (options.flags["+"]) ? "+" + str :
         (options.flags[" "]) ? " " + str :
         str;
};
var format_integer = function (num, base, options) {
  if (isNaN(num))     { return "nan"; }
  if (!isFinite(num)) { return format_infinity(num, options); }
  var padlen = 0;
  num = num > 0 ?  Math.floor(num) : -Math.floor(-num);
  if (options.precision === 0 && num === 0) { return ""; }
  var str = Math.abs(num).toString(base);
  var sign_width = (num < 0 || options.flags["+"] || options.flags[" "]) ? 1 : 0; 
  if (options.flags["0"] && (!options.flags["-"]) && options.precision === null) {
    padlen = options.min - sign_width - str.length;
  }
  if (options.precision !== null) {
    padlen = options.precision - str.length;
  }
  str = pad(str, "0", padlen, false);
  return prepend_sign_symbol(str, num, options);
};

var format_float = function (num, options, exp) {
  if (isNaN(num))     { return "nan"; }
  if (!isFinite(num)) { return format_infinity(num, options); }
  var padlen = 0;
  var str = exp ? Math.abs(num).toExponential(options.precision) : Math.abs(num).toFixed(options.precision);
  var sign_width = (num < 0 || options.flags["+"] || options.flags[" "]) ? 1 : 0;
  if (options.flags["0"] && (!options.flags["-"])) {
    padlen = options.min - sign_width - str.length;
  }
  str = pad(str, "0", padlen, false);
  return prepend_sign_symbol(str, num, options);
};

var format_infinity = function (num, options) {
  return prepend_sign_symbol("inf", num, options);
};

var defer_chain = function (obj, root, chain) {
  var i;
  for (i = 0; i < chain.length; i++) {
    var ch = chain[i];
    if (ch.type === "DotChain") {
      obj = obj[ch.member];
    } else if (ch.index.type === "Literal") {
      obj = obj[ch.index.value];
    } else {
      obj = obj[defer_chain(root[ch.index.identifier.name], root, ch.index.chain)];
    }
  }
  return obj;
};

