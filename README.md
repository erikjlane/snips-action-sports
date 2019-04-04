# snips-action-sports
#### Snips action code for the Sports app

At the moment, only a limited number of soccer tournaments and the NBA are supported.

## Setup

```sh
# Install the dependencies, builds the action and creates the config.ini file.
sh setup.sh
```

Don't forget to edit the `config.ini` file.

To be able to make calls to the API, you must have a [Sportradar Soccer Extended v3 API key](https://developer.sportradar.com/docs/read/football_soccer/Soccer_Extended_v3) as well as a [Sportradar NBA v5 API key](https://developer.sportradar.com/docs/read/basketball/NBA_v5).

## Run

- Dev mode:

```sh
# Dev mode watches for file changes and restarts the action.
npm run dev
```

- Prod mode:

```sh
# 1) Lint, transpile and test.
npm start
# 2) Compile and run the action.
tsc && node action-sports.js
```

## Debug

In the `action-sports.js` file:

```js
// Uncomment this line to print everything
// debug.enable(name + ':*')
```

## Test

*Requires [mosquitto](https://mosquitto.org/download/) to be installed.*

```sh
npm run test
```

**In test mode, i18n output and http calls are mocked.**

- **http**: see `tests/httpMocks/index.ts`
- **i18n**: see `src/factories/i18nFactory.ts`

## Contributing

Please see the [Contribution Guidelines](https://github.com/snipsco/snips-action-sports/blob/master/CONTRIBUTING.md).

## Copyright

This library is provided by [Snips](https://snips.ai) as Open Source software. See [LICENSE](https://github.com/snipsco/snips-action-sports/blob/master/LICENSE) for more information.
