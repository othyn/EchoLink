<div align="center">
    <img src="art/logo.png" alt="logo" width="128" height="auto" />
    <h1>EchoLink</h1>
</div>

<div align="center">
    <p>
        <a href="https://github.com/othyn/EchoLink/actions/workflows/release.yml">
            <img src="https://github.com/othyn/EchoLink/actions/workflows/release.yml/badge.svg" alt="build" />
        </a>
        <a href="https://github.com/othyn/EchoLink/releases">
            <img src="https://img.shields.io/github/downloads/othyn/EchoLink/total" alt="lint" />
        </a>
        <a href="https://github.com/othyn/EchoLink/graphs/contributors">
            <img src="https://img.shields.io/github/contributors/othyn/EchoLink" alt="contributors" />
        </a>
        <a href="https://github.com/othyn/EchoLink/issues/">
            <img src="https://img.shields.io/github/issues/othyn/EchoLink" alt="open issues" />
        </a>
        <a href="https://github.com/othyn/EchoLink/blob/master/LICENSE">
            <img src="https://img.shields.io/github/license/othyn/EchoLink.svg" alt="license" />
        </a>
    </p>
</div>

> A modern Chrome (Arc, Chrome, Chromium) extension to save a bookmark in [LinkAce](https://github.com/Kovah/LinkAce). Built in Vue 3, Vuetify 3, Typescript & Vite. Boilerplate provided by [create-chrome-ext](https://github.com/guocaoyi/create-chrome-ext).

Heavily inspired by [Creling/Yet-Another-LinkAce-Extension](https://github.com/Creling/Yet-Another-LinkAce-Extension), an excellent extension which I'd been using for years. I wanted to PR a few new features and bugfixes, but found it was too out of date, requiring a serious re-write from the ground up. Thus, this project now existing. I like to think of it as the spiritual successor to that extension.

The key ways in which **EchoLink** improves upon [Creling/Yet-Another-LinkAce-Extension](https://github.com/Creling/Yet-Another-LinkAce-Extension):

- Detailed error responses from the API so you know why a link submission has failed.
- Loading states so you can tell the app is doing something.
- Additional customisation options for auto closing the window and persisting the last used tags.
- Far more performant, making adding lists and tags super speedy.
- Utilises far fewer API calls, meaning you'll hit the LinkAce 60r/60s rate limit far less often.
- More consistent behaviour when checking for existing links.
- Quality of life additions, such as a manual refresh option.
- Light and dark mode support, including dynamically reading from your device preference.
- Refreshed and more modern UI.
- Modernised tooling; Manifest v3, Vue 3, Vuetify 3, Typescript, Yarn and Vite.

<div align="center">
    <img alt="screenshot" src="art/example.png" width="70%" />
</div>

## Installing

1. Make sure you are running a `Node.js` version between **14** and **19**.
2. Run `yarn install` to install the project dependencies.

## Developing

Run the following to get going with local development:

```shell
# Traverse into the project
$ cd EchoLink

# Run the local Vite hot reload environment
$ yarn dev
```

### Loading an unpacked extension

1. Set your Chrome based browser to ['Developer mode'](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).
2. Click ['Load unpacked'](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked), and select the `EchoLink/build` folder.
3. The extension should then appear as a clickable icon in the 'popup' extension space of the browser, as this is a 'popup' style extension.

## Packing & Releasing

There is a workflow that will run and generate [releases](https://github.com/othyn/EchoLink/releases) automatically, attaching the release archive.

However, to do things manually, when things are ready to ship to production, the following command will build and package the extension ready for distribution:

```shell
$ yarn package
```

A new versioned archive of the extension will be placed into the `package` directory, all bundled up and ready to be published by following the steps to ['Publish in the Chrome Web Store'](https://developer.chrome.com/webstore/publish).
