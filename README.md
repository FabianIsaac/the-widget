# The Widget

Plugin for Obsidian that adds reusable widgets (cards) for your notes. Includes ready-to-use widgets: `Basic`, `Advanced`, and `Quote`.


## Features

- Included widgets: `Basic`, `Advanced`, `Quote`.
- Configurable actions (icon + command) for the `Advanced` widget.
- Support for daily note format and buttons that trigger configurable commands.
- Daily quote: option to fetch and save the quote from an external API.

## Widgets (summary)

- **Basic** — Simple component to display a compact card with status and daily links.
- **Advanced** — Widget with configurable actions (icons that execute commands), additional information, and support for the daily quote.
- **Quote** — Widget dedicated to displaying the quote of the day.

## Usage

Widgets are mounted as Markdown block processors using the following block languages:

- `tw-basic` → mounts `Basic Widget`
- `tw-advanced` → mounts `Advanced Widget`
- `tw-quote` → mounts `Quote Widget`

Example usage in a note (insert a code block):

```markdown
```tw-basic
```

```markdown
```tw-advanced
```

```markdown
```tw-quote
```


- Add a code block in your note with the language `tw-basic`, `tw-advanced`, or `tw-quote` to mount the corresponding widget.
- Configure the actions for the `Advanced` widget from the plugin settings tab.



## Settings

Main options:

- `Link format for daily notes` (`dailyNoteFormat`): format used to create daily links.
- `Command to execute daily note` (`commandForDailyNote`): command ID executed by the daily button.
- `Command to execute weekly note` (`commandForWeeklyNote`) and `Icon for weekly note` (`iconForWeeklyNote`).
- `Actions` (`actions`): dynamic list of actions for the Advanced widget. Each action includes: `tooltip`, `icon`, `command`.
- `Use Daily Quote` (`dailyQuote`): enables/disables fetching the daily quote.

