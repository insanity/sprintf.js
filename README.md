# sprintf.js
**sprintf.js** is a complete open source JavaScript sprintf implementation for the *browser* and *node.js*.

Its prototype is simple:

    string sprintf(string format , [mixed arg1 [, mixed arg2 [ ,...]]])

The placeholders in the format string are marked by `%` and are followed by one or more of these elements, in this order:

* An optional number followed by a `$` sign that selects which argument index to use for the value. If not specified, arguments will be placed in the same order as the placeholders in the input string.
* Flags (optional, order does not matter)
    * `+` sign: that forces to preceed the result with a plus or minus sign on numeric values. By default, only the `-` sign is used on negative numbers.
    * whitespace: put a single placeholder whitespace on a positive number or zero.
    * `'` followed by a padding specifier: that says what character to use for padding (if specified). Possible values are `0` or any other character precedeed by a `'` (single quote). The default is to pad with *spaces*.
    * `-` sign: that causes sprintf to left-align the result of this placeholder. The default is to right-align the result.
    * `0`: use leading zeros to pad strings.
* An optional number, that says how many characters the result should have at minimum. If the value to be returned is shorter than this number, the result will be padded.
* An optional precision modifier, consisting of a `.` (dot) followed by a number, that says how many digits should be displayed for floating point numbers.
   When used on a string, it causes the result to be truncated. For integers, it causes the string to be padded by the leading zeros so that the number of the digits exceeds the precision number.
* A type specifier that can be any of:
    * `%` — a literal `%` character. This specifier does not consume argument.
    * `b` — a binary (0/1) representation of an integer.
    * `c` — yields an integer as the character with that Unicode codepoint.
    * `d` or `i` — an ordinary decimal representation of an integer.
    * `e` or `E` — a floating point number using scientific notation. (with notation `x`e+`y` means `x` × 10^`y`)
    * `u` — an decimal representation of an integer, interpreted as an unsigned number.
    * `f` or `F`  — a float as is.
    * `o` — an octal representation of an integer.
    * `s` — a string as is.
    * `x` or `X` — a hexadecimal representation of an integer.
* Uppercase specifier yields an upperfield number (for example, "0xFE", "0x2.000000E+0", or "INF")

Notes: sprintf.js does not support "#" flag and "'" flag (for grouping digits in thousands) now.

## JavaScript `vsprintf`
`vsprintf` is the same as `sprintf` except that it accepts an array of arguments, rather than a variable number of arguments:

    vsprintf("The first 4 letters of the english alphabet are: %s, %s, %s and %s", ["a", "b", "c", "d"])

## Argument swapping
You can also swap the arguments. That is, the order of the placeholders doesn't have to match the order of the arguments. You can do that by simply indicating in the format string which arguments the placeholders refer to:

    sprintf("%2$s %3$s a %1$s", "cracker", "Polly", "wants")
And, of course, you can repeat the placeholders without having to increase the number of arguments.

## Named arguments
Format strings may contain replacement fields rather than positional placeholders. Instead of referring to a certain argument, you can now refer to a certain key within an object. Replacement fields are surrounded by rounded parentheses - `(` and `)` - and begin with a keyword that refers to a key:
    var user = {
        name: "Dolly"
    }
    sprintf("Hello %(name)s", user) // Hello Dolly

Keywords in replacement fields can be optionally followed by any number of keywords or indexes:
    var users = [
        {name: "Dolly"},
        {name: "Molly"},
        {name: "Polly"}
    ]
    sprintf("Hello %(users[0].name)s, %(users[1].name)s and %(users[2].name)s", {users: users}) // Hello Dolly, Molly and Polly

Literal numbers, quoted strings, or another named arguments can be passed as an index:
    var greetings  = {
        morning: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening"
    }
    sprintf("%(greetings[time])s, Dolly!", { greetings: greetings, time: "afternoon" }) // Good afternoon, Dolly

# AngularJS
You can now use `sprintf` and `vsprintf` (also aliased as `fmt` and `vfmt` respectively) in your AngularJS projects. See `demo/`.

# Installation

### Usage

    var sprintf = require("sprintf-js").sprintf,
        vsprintf = require("sprintf-js").vsprintf

    sprintf("%2$s %3$s a %1$s", "cracker", "Polly", "wants")
    vsprintf("The first 4 letters of the english alphabet are: %s, %s, %s and %s", ["a", "b", "c", "d"])

# License

**sprintf.js** is licensed under the terms of the 3-clause BSD license.
