var assert = require("assert"),
    sprintfjs = require("../dist/sprintf.js"),
    sprintf = sprintfjs.sprintf,
    vsprintf = sprintfjs.vsprintf;

describe("sprintf", function() {
    it("is a function", function () {
        assert.equal("function", typeof sprintf);
    });
    it("should return '%' for the template '%%'", function () {
        assert.equal("%", sprintf("%%"));
    });
    it("should support integer templates", function () {
        assert.equal("10", sprintf("%b", 2));
        assert.equal("A", sprintf("%c", 65));
        assert.equal("2", sprintf("%d", 2));
        assert.equal("-42", sprintf("%d", -42));
        assert.equal("2", sprintf("%i", 2));
        assert.equal("2", sprintf("%d", "2"));
        assert.equal("2", sprintf("%i", "2"));
        assert.equal("2", sprintf("%u", 2));
        assert.equal("4294967294", sprintf("%u", -2));
        assert.equal("ff", sprintf("%x", 0xff));
        assert.equal("FF", sprintf("%X", 0xff));
        assert.equal("10", sprintf("%o", 8))
    });
    it("should support floating point templates", function () {
        assert.equal("2.000000e+0", sprintf("%e", 2));
        assert.equal("2.250000E+0", sprintf("%E", 2.25));
        assert.equal("2.250000", sprintf("%f", 2.25));
    });
    it("should support the string template", function () {
        assert.equal("blah blah blah", sprintf("%s", "blah blah blah"));
        assert.equal("0.0000000", sprintf("%s", "0.0000000"));
        assert.equal("<αβγ一二三\t\n\v>", sprintf("<%s>", "αβγ一二三\t\n\v"));
        assert.equal("2.25", sprintf("%s", 2.25));
    });
    it("should apply conversion to n-th argument for '%n$' form", function () {
        assert.equal("pi:3.141592 answer:42", sprintf("pi:%2$f answer:%1$d", 42, 3.141592));
        assert.equal("Polly wants a cracker", sprintf("%2$s %3$s a %1$s", "cracker", "Polly", "wants"));
    });
    it("should support %(dotchain) form", function () {
        assert.equal("Hello world!", sprintf("Hello %(who)s!", {"who": "world"}));
        assert.equal("Hello Alice!", sprintf("Hello %(who.name)s!", {"who": { "name": "Alice"}}));
        assert.equal("Hello Bob!", sprintf("Hello %(who[0])s!", {"who": ["Bob", "C.", "Dobbie"]}));
        assert.equal("Hello Charlie!", sprintf("Hello %(who['name'])s!", {"who": { "name": "Charlie"}}));
        assert.equal("Hello David!", sprintf("Hello %(who[call_by])s!", {"who": { "firstname": "David", }, "call_by": "firstname"}));
    });
    it("should round floats towards zero for integer templates", function() {
        assert.equal("2", sprintf("%d", 2.8));
        assert.equal("-2", sprintf("%d", -2.1));
    });
    it("should convert non-numerics into 'nan' for numeric templates", function () {
        assert.equal("nan", sprintf("%d", "blah"));
        assert.equal("NAN", sprintf("%F", "blah"));
    });
    it("should support sign symbol specification (flag '+' and ' ')", function() {
        assert.equal("+2", sprintf("%+d", 2));
        assert.equal("-2", sprintf("%+d", -2));
        assert.equal(" 2", sprintf("% d", 2));
        assert.equal("-2", sprintf("% d", -2));
        assert.equal("+2", sprintf("% +d", 2));
        assert.equal("-2", sprintf("% +d", -2));
        assert.equal("+2.000000", sprintf("%+f", 2));
        assert.equal("-2.000000", sprintf("%+f", -2));
        assert.equal(" 2.000000", sprintf("% f", 2));
        assert.equal("-2.000000", sprintf("% f", -2));
        assert.equal("+2.000000e+0", sprintf("%+e", 2));
        assert.equal("-2.000000e+0", sprintf("%+e", -2));
    });
    it("should support precision for floating point numbers", function() {
        assert.equal("-2.3", sprintf("%.1f", -2.34));
        assert.equal("-0.0", sprintf("%.1f", -0.01));
        assert.equal("-0", sprintf("%.0f", -0.01));
        assert.equal("2.0e+0", sprintf("%.1e", 2.01));
        assert.equal("2e+0", sprintf("%.0e", 2.01));
    });
    it("should support precision for integers", function() {
        assert.equal("", sprintf("%.0d", 0));
        assert.equal("", sprintf("%.0d", -0.1));
        assert.equal("0023", sprintf("%.4d", 23));
        assert.equal("-0023", sprintf("%.4d", -23));
        // ignore "0" flag
        assert.equal("-0023", sprintf("%04.4d", -23));
    });
    it("should support precision for strings", function() {
        assert.equal("abrac", sprintf("%5.5s", "abracadabra"));
        assert.equal("    a", sprintf("%5.1s", "abracadabra"));
    });
    it("should support '0' flag", function() {
        assert.equal("-000000123", sprintf("% 010d", -123));
        assert.equal(" 000000123", sprintf("% 010d", 123));
        assert.equal("-00000123.000000", sprintf("% 016f", -123));
        assert.equal("-000000123", sprintf("% 010.0f", -123));
    });
    it("should support padding", function() {
        assert.equal("______-123", sprintf("%'_10d", -123));
        assert.equal("    <", sprintf("%5s", "<"));
        assert.equal("____<", sprintf("%'_5s", "<"));
        // use of 0 flag in %s specifier is undefined in the standard
        assert.equal("0000<", sprintf("%05s", "<"));
        assert.equal(">    ", sprintf("%-5s", ">"));
        assert.equal(">____", sprintf("%'_-5s", ">"));
        assert.equal(">0000", sprintf("%0-5s", ">"));
        assert.equal("abracadabra", sprintf("%5s", "abracadabra"));
        assert.equal("   -10.235", sprintf("%10.3f", -10.23456));
        assert.equal("___-10.235", sprintf("%'_10.3f", -10.23456));
    });
    it("should support formatting infinity", function() {
        assert.equal("inf", sprintf("%f", Infinity));
        assert.equal(" inf", sprintf("% f", Infinity));
        assert.equal("-inf", sprintf("%f", -Infinity));
        assert.equal("-inf", sprintf("%.5f", -Infinity));
        assert.equal(" -inf", sprintf("%5f", -Infinity));
        assert.equal(" -inf", sprintf("%05f", -Infinity));
        assert.equal(" -INF", sprintf("%05F", -Infinity));
    });
    it("should throw error for insufficient arguments", function () {
        var undef;
        assert.throws(function(){sprintf("%d");}, Error, "1 or more arguments are required, but got only 0");
        assert.throws(function(){sprintf("%4$d", 1, 2);}, Error, "4 or more arguments are required, but got only 2");
        assert.equal("undefined", sprintf("%s", undef));
    });
});
