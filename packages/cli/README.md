# @gmljs/cli

Command line tool for rendering [GML (Graffiti Markup Language)](https://en.wikipedia.org/wiki/Graffiti_Markup_Language)
documents to images, built on the [`@gmljs/render`](https://www.npmjs.com/package/@gmljs/render) library.

## Installation

```
npm install -g @gmljs/cli
```

## Usage

```
Usage: gmljs [options] <file> ...

Render GML documents to images.

Arguments:
  file                         GML document file(s)

Options:
  -V, --version                output the version number
  -o, --out <path>             target file or directory
  -w, --width <size>           force image width (default: 1024)
  -h, --height <size>          force image height (default: 768)
  -b, --background <hexcolor>  background color (default: "white")
  -f, --format <format>        output format (choices: "png", "jpeg", default: "png")
  --help                       print help text

Effect options
  --drips                      enable drip effect (experimental)
  --drip-factor <value>        drip factor 0-1 (default 0.2)
```

## Examples

```
$ gmljs ~/nyc/zephyr.gml
✅ Rendered 1024x768 png file: ~/nyc/zephyr.png
$ gmljs ~/nyc/dondi.gml --format jpeg
✅ Rendered 1024x768 jpeg file: ~/nyc/dondi.jpg
$ gmljs ~/nyc/cope2.gml -w 1920 -h 1080 --background '#aaddff'
✅ Rendered 1920x1080 png file: ~/nyc/cope2.png
```

## Notes

Input files larger than 32 MB are rejected.
