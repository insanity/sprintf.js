ConversionTemplate =
  (String / ConversionSpecification)+

String =
  [^%]+ { return text(); }

ConversionSpecification =
  '%' val:('%' / pos:Position? flags:Flags? min:MinWidth? prec:Precision? spec:Specifier
    { return { type: "spec", postion: pos, flags: flags, min: min, precision: prec, specifier: spec }; })
    { return val; }

Position = int:PositiveDecimalInteger '$' { return int; }

Flags =
  array:Flag* { return array_to_obj(array, "'-+ #0"); }

Flag "flag ('-+#0 or whitespace)" = [\'\-\+\ #0]

MinWidth = PositiveDecimalInteger / '*'

Precision =
  "." p:(DecimalIntegerLiteral / '*') { return parseInt(p); }

PositiveDecimalInteger "positive integer" =
  NonZeroDigit DecimalDigit* { return parseInt(text()); }

Specifier "conversion specifier (bdiouxXfFeEgGaAcs)"= [bdiouxXfFeEgGaAcs]

AConversionTemplate =
  (String / AConversionSpecification)+

AConversionSpecification =
  '%' val:('%' / pos:(Position / NamedArgument)? flags:AFlags? min:MinWidth? prec:Precision? spec:Specifier
    { return { type: "ext_spec", position: pos, flags: flags, min: min, precision: prec, specifier: spec }; })
    { return val; }
    
AFlags =
  array:AFlag*  { return array_to_obj(array, "'-+ #0"); }

AFlag "flag (-+#0, whitespace, or 'padchar)" =
  [\-\+\ #0] / "'" c:. { return {key: "'", value: c}; } 

NamedArgument =
  '(' m:MemberExpression ')' { return m; }

MemberExpression =
  first:IdentifierName _ rest:(DotChain / BracketAccessor)* { return { type: "Member", identifier: first, chain: rest }; }

DotChain =
  "." _ n:IdentifierName _ { return { type: "DotChain", member: n.name }; }

BracketAccessor =
  "[" _ exp:Expression _ "]" _ { return { type: "Bracket", index: exp}; }

Expression =
  Literal / MemberExpression
