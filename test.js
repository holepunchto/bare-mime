const test = require('brittle')
const MIME = require('.')

test('parse basic type', (t) => {
  const mime = MIME.parse('text/plain')
  t.is(mime.type, 'text')
  t.is(mime.subtype, 'plain')
  t.is(mime.parameters.size, 0)
})

test('parse with leading and trailing whitespace', (t) => {
  const mime = MIME.parse('  \t text/plain \r\n ')
  t.is(mime.type, 'text')
  t.is(mime.subtype, 'plain')
})

test('parse lowercases type and subtype', (t) => {
  const mime = MIME.parse('TEXT/PLAIN')
  t.is(mime.type, 'text')
  t.is(mime.subtype, 'plain')
})

test('parse with parameter', (t) => {
  const mime = MIME.parse('text/plain;charset=utf-8')
  t.is(mime.type, 'text')
  t.is(mime.subtype, 'plain')
  t.is(mime.parameters.get('charset'), 'utf-8')
})

test('parse with whitespace around parameter', (t) => {
  const mime = MIME.parse('text/plain; charset=utf-8')
  t.is(mime.parameters.get('charset'), 'utf-8')
})

test('parse lowercases parameter name', (t) => {
  const mime = MIME.parse('text/plain;CHARSET=utf-8')
  t.is(mime.parameters.get('charset'), 'utf-8')
})

test('parse with quoted parameter value', (t) => {
  const mime = MIME.parse('text/plain;charset="utf-8"')
  t.is(mime.parameters.get('charset'), 'utf-8')
})

test('parse with escaped character in quoted value', (t) => {
  const mime = MIME.parse('text/plain;charset="utf\\"8"')
  t.is(mime.parameters.get('charset'), 'utf"8')
})

test('parse with backslash escape in quoted value', (t) => {
  const mime = MIME.parse('text/plain;charset="utf\\\\8"')
  t.is(mime.parameters.get('charset'), 'utf\\8')
})

test('parse with multiple parameters', (t) => {
  const mime = MIME.parse('text/plain;charset=utf-8;boundary=something')
  t.is(mime.parameters.get('charset'), 'utf-8')
  t.is(mime.parameters.get('boundary'), 'something')
})

test('parse keeps first value for duplicate parameter', (t) => {
  const mime = MIME.parse('text/plain;charset=utf-8;charset=us-ascii')
  t.is(mime.parameters.get('charset'), 'utf-8')
})

test('parse trailing whitespace on subtype', (t) => {
  const mime = MIME.parse('text/plain  ')
  t.is(mime.subtype, 'plain')
})

test('parse trailing whitespace on unquoted parameter value', (t) => {
  const mime = MIME.parse('text/plain;charset=utf-8  ')
  t.is(mime.parameters.get('charset'), 'utf-8')
})

test('parse returns null for empty input', (t) => {
  t.is(MIME.parse(''), null)
})

test('parse returns null for missing subtype', (t) => {
  t.is(MIME.parse('text'), null)
  t.is(MIME.parse('text/'), null)
})

test('parse returns null for empty type', (t) => {
  t.is(MIME.parse('/plain'), null)
})

test('parse returns null for invalid type code points', (t) => {
  t.is(MIME.parse('te xt/plain'), null)
})

test('parse returns null for invalid subtype code points', (t) => {
  t.is(MIME.parse('text/pla in'), null)
})

test('parse skips parameter with no value', (t) => {
  const mime = MIME.parse('text/plain;charset')
  t.is(mime.type, 'text')
  t.is(mime.parameters.size, 0)
})

test('parse skips parameter with empty unquoted value', (t) => {
  const mime = MIME.parse('text/plain;charset=')
  t.is(mime.parameters.size, 0)
})

test('parse skips parameter with invalid name code points', (t) => {
  const mime = MIME.parse('text/plain;cha rset=utf-8')
  t.is(mime.parameters.size, 0)
})

test('parse with parameter name followed by semicolon', (t) => {
  const mime = MIME.parse('text/plain;charset;charset=utf-8')
  t.is(mime.parameters.get('charset'), 'utf-8')
})

test('parse application/json', (t) => {
  const mime = MIME.parse('application/json')
  t.is(mime.type, 'application')
  t.is(mime.subtype, 'json')
})

test('parse multipart/form-data with boundary', (t) => {
  const mime = MIME.parse('multipart/form-data;boundary=----WebKitFormBoundary')
  t.is(mime.type, 'multipart')
  t.is(mime.subtype, 'form-data')
  t.is(mime.parameters.get('boundary'), '----WebKitFormBoundary')
})
