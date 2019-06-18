# snips-action-sports

Snips action code for the Sports app

At the moment, only a limited number of soccer tournaments and the NBA are supported.

## Setup

```sh
# Install the dependencies, builds the action and creates the config.ini file.
sh setup.sh
```

Don't forget to edit the `config.ini` file.

To be able to make calls to the API, you must have a [Sportradar Soccer Extended v3 API key](https://developer.sportradar.com/docs/read/football_soccer/Soccer_Extended_v3) as well as a [Sportradar NBA v5 API key](https://developer.sportradar.com/docs/read/basketball/NBA_v5).

An assistant containing the intents listed below must be installed on your system. Deploy it following [these instructions](https://docs.snips.ai/articles/console/actions/deploy-your-assistant).

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
npm run launch
```

## Test & Demo cases

This app only supports french 🇫🇷 and english 🇬🇧.

### `MatchResult`

#### Get sports results of teams and tournaments

Get results for the given team
> *Hey Snips, how did the Lakers do in the last game*

Get results for the given tournament
> *Hey Snips, give me an update on the Champion's League*

Get results for a team in the given tournament
> *Hey Snips, how did the last game between Manchester United and Arsenal in Premier League do?*

### `TournamentStanding`

#### Get the current standing of a team within a tournament, or the general standing of a tournament

Get the current standing of a given tournament
> *Hey Snips, what teams are leading in the french football league?*

Get the current standing of the given team in the given tournament
> *Hey Snips, what is the standing of Chelsea in the Premier League?*

### `NextMatch`

#### Get details about future matches

Get details about future matches of the given team
> *Hey Snips, when can we see the next match between Manchester City and Manchester United?*

Get details about future matches of the given tournament
> *Hey Snips, what are the details of the upcoming Bundesliga matches?*

Get details about future matches of a team in the given tournament
> *Hey Snips, when are the Chicago Bulls playing again in the NBA?*

## Debug

In the `src/index.ts` file:

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

- **http**: mocks are written in `tests/httpMocks/index.ts`
- **i18n**: mocked by `snips-toolkit`, see the [documentation](https://github.com/snipsco/snips-javascript-toolkit#i18n).

## Contributing

Please see the [Contribution Guidelines](https://github.com/snipsco/snips-action-sports/blob/master/CONTRIBUTING.md).

## Copyright

This library is provided by [Snips](https://snips.ai) as Open Source software. See [LICENSE](https://github.com/snipsco/snips-action-sports/blob/master/LICENSE) for more information.
