# End-to-end test fixtures

`hello.zip.b64` is a Base64 encoding of
`caprice32/test/integrated/dsk/hello.zip`. The DSK image contains the
`HELLO.BAS` BASIC program, which prints `Hello, World !`.

The fixture comes from the Caprice32 repository and is distributed under
GPL-2.0. It is encoded as text so it remains inspectable during code review;
the Playwright test decodes it in memory before loading it through the file
picker.
