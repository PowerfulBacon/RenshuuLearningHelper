# Renshuu Study Budy

## Notes

- This app is entirely local and does not have a Backend.
- This app will store mnemonics and cache some dictionary items in local storage to reduce the number of requests that the app uses.
- Loading large schedules may use a lot of requests. Upgrade to Renshuu pro to get 2000 daily requests or only access smaller schedules.
- **This app does not replace Renshuu quizes and only assists with the studying of new terms. You still need to use Renshuu to complete the quizes, and this only helps you learn the terms in parts!**

## Users: Getting Started

1. Navigate to https://powerfulbacon.github.io/RenshuuLearningHelper/
2. Enter your read-only API key, which can be found at https://www.renshuu.org/index.php?page=misc/api
3. Select a schedule that you want to learn, select the terms you want to learn or press 'Next Set' which will auto-select the next 6 that Renshuu will quiz you on.
4. Study the terms and complete the quiz.
5. Go to Renshuu, and complete the quiz.
6. Repeat from step 3.

## Developers: Getting Started

### Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

Alternatively just run in Visual Studio IDE.

### Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

### Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

### Project Setup

```sh
npm install
```

#### Compile and Hot-Reload for Development

```sh
npm run dev
```

#### Type-Check, Compile and Minify for Production

```sh
npm run build
```

#### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
