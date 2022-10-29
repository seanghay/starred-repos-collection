## Starred Repositories Collection

Organize your starred repos on GitHub

## Environment variables

```shell
# a GitHub username to pull from
GH_LOGIN=

# a personal access token of GitHub
GH_TOKEN=
```

> **Warning**
> This config is not required if you're running it inside GitHub actions. It's only needed when running on Node.js.

## Download

This script will download all your starred repos into a `./data/` and it will be store as JSON file.

```shell
node main.js
```

## Generate

It will generate `./data/languages.md` for you.

```shell 
node generator.js
```
