# Rive Animation Integration Guide

A **framework-agnostic** guide to integrating Rive animations, setting initial values, and working with the view model and state machine from code. Use it in any project (React, Vue, Astro, vanilla JS, etc.) that uses the Rive runtime.

---

## 1. Prerequisites

- **Runtime:** [@rive-app/canvas](https://www.npmjs.com/package/@rive-app/canvas) (or another Rive web runtime).
- **Asset:** A `.riv` file (hosted URL or bundled path).

```bash
npm install @rive-app/canvas
```

---

## 2. Integration Overview

### 2.1 What you need in your app

1. **A container element** (e.g. a `<div>`) with explicit dimensions (CSS). The Rive runtime will render into a `<canvas>` inside it or that you pass to it.
2. **Rive instance** created with:
   - `src` (or `buffer` / `riveFile`) — the .riv file
   - `canvas` — the canvas element
   - `stateMachines` — name(s) of the state machine(s) to run (optional if you only use timeline animations)
   - `viewModel` — name of the view model for data binding (optional)
   - `autoplay`, `autoBind`, etc.
3. **Callback when the file is loaded** (e.g. `onLoad`) so you can bind the view model and set initial values.

### 2.2 Minimal setup (vanilla JS + @rive-app/canvas)

```javascript
import { Rive } from '@rive-app/canvas';

const container = document.querySelector('.rive-container');
const canvas = document.createElement('canvas');
container.appendChild(canvas);

const rive = new Rive({
  src: '/path/to/your-file.riv',
  canvas,
  stateMachines: 'State Machine 1',
  viewModel: 'ViewModel1',
  autoplay: true,
  autoBind: false,
  onLoad: () => {
    bindViewModel(rive);
    setInitialValues(rive);
  },
});
```

In your project you might wrap this in a component (e.g. React, Vue, or a custom class); the important part is that you eventually have:

- The **Rive instance** (e.g. from `new Rive({ ... })`).
- The **view model instance** (from `rive.viewModelByName('ViewModel1').defaultInstance()` or similar), bound with `rive.bindViewModelInstance(instance)`.

Property names (`State Machine 1`, `ViewModel1`) must match the names in your .riv file.

---

## 3. Binding the View Model

If you use **data binding** in Rive, bind the view model after load (when `autoBind` is false):

```javascript
function bindViewModel(rive) {
  const viewModel = rive.viewModelByName('ViewModel1');
  if (!viewModel) return;

  const instance = viewModel.defaultInstance() ?? viewModel.instanceByIndex(0);
  if (!instance) return;

  rive.bindViewModelInstance(instance);
  return instance;
}
```

Store the returned `instance` (e.g. in a variable or component state) and use it for reading/writing properties below.

---

## 4. Setting Values on Initialization

Call these after the file has loaded and the view model is bound. Replace `viewModel` with your stored view model instance.

### 4.1 Numbers

```javascript
function setInitialValues(viewModel) {
  if (!viewModel) return;

  const cardChoice = viewModel.number('cardChoice');
  if (cardChoice) cardChoice.value = 0;

  const leftPct = viewModel.number('leftPercentage');
  if (leftPct) leftPct.value = 90;

  const midPct = viewModel.number('midPercentage');
  if (midPct) midPct.value = 69;

  const rightPct = viewModel.number('rightPercentage');
  if (rightPct) rightPct.value = 68;
}
```

Use the exact property names from your Rive view model.

### 4.2 Enum (e.g. language / variant)

```javascript
const lang = viewModel.enum('enumProperty');
if (lang) lang.value = 'French';  // use exact enum value from Rive
```

### 4.3 Strings

```javascript
const title = viewModel.string('leftFRENCHtitle');
if (title) title.value = 'Custom title text';
```

### 4.4 Boolean

```javascript
const flag = viewModel.boolean('someFlag');
if (flag) flag.value = true;
```

### 4.5 Trigger (fire once)

```javascript
const t = viewModel.trigger('someTrigger');
if (t) t.trigger();
```

---

## 5. Parsing All View Model Fields in Code

To discover and use every view model property at runtime (e.g. for debugging, admin UI, or generic tooling), iterate over the bound instance.

### 5.1 List all property names

```javascript
const viewModel = rive.viewModelInstance; // or your stored instance
if (!viewModel) return;

const propertyNames = (viewModel.properties ?? []).map(p => p.name);
console.log('ViewModel property names:', propertyNames);
```

### 5.2 Detect type and get value per property

For each property `name`, you can resolve its type and read the value:

```javascript
function getPropertyKind(viewModel, name) {
  if (viewModel.number(name)) return 'number';
  if (viewModel.string(name)) return 'string';
  if (viewModel.boolean(name)) return 'boolean';
  if (viewModel.trigger(name)) return 'trigger';
  if (viewModel.enum(name)) return 'enum';
  if (viewModel.list(name)) return 'list';
  if (viewModel.color(name)) return 'color';
  return 'unknown';
}

function getPropertyValue(viewModel, name) {
  const n = viewModel.number(name);
  if (n) return n.value;

  const s = viewModel.string(name);
  if (s) return s.value;

  const b = viewModel.boolean(name);
  if (b) return b.value;

  const e = viewModel.enum(name);
  if (e) return e.value;

  const c = viewModel.color(name);
  if (c) return c.value;

  return undefined;
}
```

### 5.3 Build a table of all properties (debug)

```javascript
const props = (viewModel.properties ?? []).map(p => p.name);
const table = props.map(name => ({
  name,
  kind: getPropertyKind(viewModel, name),
  value: getPropertyValue(viewModel, name),
}));
console.table(table);
```

### 5.4 Writing by type (safe)

Do not assign to optional chains (e.g. `viewModel?.number('x')?.value = 1`). Get the reference first, then assign:

```javascript
// Number
const num = viewModel.number('cardChoice');
if (num) num.value = 2;

// String
const str = viewModel.string('leftFRENCHtitle');
if (str) str.value = 'New title';

// Boolean
const bool = viewModel.boolean('someFlag');
if (bool) bool.value = true;

// Enum
const enumProp = viewModel.enum('enumProperty');
if (enumProp) enumProp.value = 'German';

// Trigger
const triggerProp = viewModel.trigger('clicked');
if (triggerProp) triggerProp.trigger();
```

---

## 6. State Machine Inputs

State machine inputs are separate from the view model. Use the Rive instance:

```javascript
// List state machine names (current artboard)
const stateMachineNames = rive.stateMachineNames ?? [];

// Get inputs for a given state machine
const stateMachineName = 'State Machine 1';
const inputs = rive.stateMachineInputs(stateMachineName) ?? [];

inputs.forEach((input) => {
  console.log(input.name, input.type, input.value);
  // For number/boolean: input.value = newValue
  // For trigger: input.fire()
});
```

Property names may differ slightly in other runtimes (e.g. `getStateMachineInputs`); check the [Rive docs](https://rive.app/docs) for your runtime.

---

## 7. Quick Reference: View Model API

| Type    | Read                             | Write                                  |
|---------|----------------------------------|----------------------------------------|
| Number  | `viewModel.number(path).value`  | `viewModel.number(path).value = n`     |
| String  | `viewModel.string(path).value`  | `viewModel.string(path).value = s`     |
| Boolean | `viewModel.boolean(path).value` | `viewModel.boolean(path).value = b`    |
| Enum    | `viewModel.enum(path).value`   | `viewModel.enum(path).value = 'Name'` |
| Trigger | —                               | `viewModel.trigger(path).trigger()`    |
| Color   | `viewModel.color(path).value`  | `viewModel.color(path).value = n` or `.rgb()` / `.rgba()` |

`path` is the property name (or dot-separated path) as defined in the Rive view model. Get the list from `viewModel.properties`.

---

## 8. Accessibility & SEO

- Set **`aria-hidden="true"`** on the Rive container so screen readers skip the canvas.
- Provide a **separate, semantic HTML** block (e.g. `<section>`, `<article>`, `<details>`) that describes the same content as the animation.
- Place that block in a **visually hidden** wrapper (e.g. `.sr-only` with `position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0);`) so it is read by screen readers and indexed by search engines, while sighted users see only the Rive animation.

---