#!/usr/bin/env node
import { program, Option, InvalidArgumentError } from "commander";
import fs from "node:fs";
import path from "node:path";
import packageJson from "../package.json" with { type: "json" };
import { createGMLImage } from "@gmljs/render/server";

// GML files are rarely more than a few megabytes; this guards against parsing something else.
const MAX_FILE_SIZE = 32 * 1024 * 1024;

function parseSize(value: string): number {
  const size = Number(value);
  if (!Number.isInteger(size) || size <= 0) {
    throw new InvalidArgumentError("Must be a positive integer.");
  }
  return size;
}

function parseDripFactor(value: string): number {
  const factor = value.trim() === "" ? Number.NaN : Number(value);
  if (!(factor >= 0 && factor <= 1)) {
    throw new InvalidArgumentError("Must be a number from 0 to 1.");
  }
  return factor;
}

program
  .name("gmljs")
  .description("Render GML documents to images.")
  .usage("[options] <file> ...")
  .version(packageJson.version)
  .showHelpAfterError()
  .helpOption("--help", "print help text")
  .argument("<file...>", "GML document file(s)")
  .option("-o, --out <path>", "target file or directory")
  .option("-w, --width <size>", "force image width", parseSize, 1024)
  .option("-h, --height <size>", "force image height", parseSize, 768)
  .option("-b, --background <hexcolor>", "background color", "white")
  .addOption(
    new Option(
      "--clear-color <hexcolor>",
      "color outside the document (default: background)",
    ).hideHelp(),
  )
  .addOption(
    new Option("-f, --format <format>", "output format").choices(["png", "jpeg"]).default("png"),
  )
  .optionsGroup("Effect options")
  .option("--drips", "enable drip effect (experimental)")
  .option("--drip-factor <value>", "drip factor 0-1 (default 0.2)", parseDripFactor)
  .parse(process.argv);

const options = program.opts();
const { format, width, height, out, background, clearColor, drips, dripFactor } = options;
const files = program.args;

if (out && !fs.existsSync(out) && files.length > 1) {
  console.error(`❌ Directory "${out}" does not exist.`);
  process.exit(1);
}

const outputName = (file: string) =>
  `${path.basename(file).replace(/\.(?:gml|xml)$/i, "")}.${format}`;

if (out && files.length > 1) {
  // Files with the same name from different directories would overwrite each other.
  const seen = new Map<string, string>();
  for (const file of files) {
    const name = outputName(file);
    const other = seen.get(name);
    if (other !== undefined && path.resolve(other) !== path.resolve(file)) {
      console.error(`❌ "${other}" and "${file}" would both be written to "${name}".`);
      process.exit(1);
    }
    seen.set(name, file);
  }
}

let hasError = false;

for (const file of files) {
  try {
    // statSync follows symlinks, so a link to a file is accepted.
    const stats = fs.existsSync(file) ? fs.statSync(file) : undefined;
    if (!stats?.isFile()) {
      throw new Error(`"${file}" is not a file.`);
    }
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error(`"${file}" is larger than ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
    }
    if (out && !fs.existsSync(out) && files.length > 1) {
      throw new Error(`"${out}" is not a directory.`);
    }

    let outFile = `${file.replace(/\.(?:gml|xml)$/i, "")}.${format}`;

    if (out) {
      const gmlFileExt = outputName(file);
      if (files.length > 1) {
        // out is a directory
        outFile = path.join(out, gmlFileExt);
      } else {
        // out can be both file/directory
        if (fs.existsSync(out)) {
          outFile = fs.statSync(out).isDirectory() ? path.join(out, gmlFileExt) : out;
        } else {
          if (!fs.existsSync(path.dirname(out))) {
            throw new Error(`Cannot write "${out}", directory does not exist.`);
          }
          outFile = out;
        }
      }
    }

    const document = fs.readFileSync(file, "utf8");

    const image = await createGMLImage(document, {
      width,
      height,
      background,
      clearColor,
      drips: drips ?? false,
      dripFactor,
      format: format === "jpeg" ? "jpeg" : "png",
    });

    fs.writeFileSync(outFile, Buffer.from(image));

    console.log(`✅ Rendered ${width}x${height} ${format} file: ${outFile}`);
  } catch (err) {
    hasError = true;
    console.error(
      `❌ Failed to render ${file}: ${err instanceof Error ? err.message : "Unknown Error"}`,
    );
  }
}

process.exit(hasError ? 1 : 0);
