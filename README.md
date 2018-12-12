# yamltmpl
yaml data to mustache mapper.

# usage
```shell
Usage: yamltmpl [options]
Options:
  --template                         template path (required)
  --context-path                     context files dir path (required)
  --out                              output path dir (required)
  --extension                        output file extension (required)
  --dry-run                          dry-run mode
  --help                             Shows the usage and exits.
  --version                          Shows version number and exits.
Examples:
  yamltmpl --template tmpl.mustache --context-path ctxdir --out out --extension .ts
```
