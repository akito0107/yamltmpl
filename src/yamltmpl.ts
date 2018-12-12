#!/usr/bin/env node

import * as changeCase from "change-case";
import * as fs from "fs";
import * as Handlebars from "handlebars";
import * as yaml from "js-yaml";
import * as minimist from "minimist";
import * as path from "path";

const help = `
Usage: yamltmpl [options]
Options:
  --template                         template path (required)
  --context-path                     context files dir path (required)
  --out                              output path dir (required)
  --extension                        output file extension (required)
  --prefix                           prefix strings
  --dry-run                          dry-run mode
  --help                             Shows the usage and exits.
  --version                          Shows version number and exits.
Examples:
  yamltmpl --template tmpl.mustache --context-path ctxdir --out out --extension .ts
`.trim();

function main() {
  const argv = minimist(process.argv.slice(2), {
    string: [
      "version",
      "template",
      "context-path",
      "output",
      "output-extension",
      "prefix"
    ],
    boolean: ["help", "dry-run"]
  });

  if (argv.help) {
    return showHelp(0, help);
  }

  if (argv.version) {
    const pack = require("../package.json");
    process.stdout.write(pack.version);
    return;
  }

  if (!argv.template) {
    process.stderr.write("--template is required");
    return showHelp(1, help);
  }

  if (!argv["context-path"]) {
    process.stderr.write("--context-path is required");
    return showHelp(1, help);
  }

  if (!argv.out) {
    process.stderr.write("--out is required");
    return showHelp(1, help);
  }

  if (!argv.extension) {
    process.stderr.write("--extension is required");
    return showHelp(1, help);
  }

  enhanceHandlebars(Handlebars);

  const contexts = loadContexts(argv["context-path"]);
  renderTemplate(
    argv.template,
    contexts,
    argv.out,
    argv.extension,
    argv.prefix,
    argv["dry-run"]
  );
}

function loadContexts(srcPath: string): object[] {
  const basePath = path.resolve(process.cwd(), srcPath);
  const files = fs.readdirSync(basePath);
  const contexts = files.map(f => {
    const doc = yaml.safeLoad(
      fs.readFileSync(path.resolve(basePath, f), "utf8")
    );
    return {
      fileName: f
        .split(".")
        .slice(0, -1)
        .join("."),
      ...doc
    };
  });
  return contexts;
}

function renderTemplate(
  templatePath: string,
  contexts: object[],
  outputPath,
  outputExtension: string,
  prefix: string = "",
  dryRun: boolean = true
) {
  const basePath = process.cwd();
  const outPath = path.resolve(process.cwd(), outputPath);
  const template = Handlebars.compile(
    fs.readFileSync(path.resolve(basePath, templatePath), "utf8")
  );
  contexts.forEach((c: any) => {
    const data = template(c);
    const outFileName = path.resolve(
      outPath,
      prefix + c.fileName + outputExtension
    );
    if (dryRun) {
      process.stdout.write(`going to write ${outFileName}\n`);
      process.stdout.write(data);
    } else {
      fs.writeFileSync(outFileName, data);
    }
  });
}

function showHelp(exitcode, helpstr) {
  process.stdout.write(helpstr);
  process.exit(exitcode);
}

function enhanceHandlebars(handlebars) {
  handlebars.registerHelper("increments", value => {
    return parseInt(value) + 1;
  });
  handlebars.registerHelper("toSnake", value => {
    return changeCase.snakeCase(value);
  });
  handlebars.registerHelper("toCamel", value => {
    return changeCase.camelCase(value);
  });
  handlebars.registerHelper("toPascal", value => {
    return changeCase.pascalCase(value);
  });
  handlebars.registerHelper("toLowerCaseFirst", value => {
    return changeCase.lowerCaseFirst(value);
  });
}

main();
