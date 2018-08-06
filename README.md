# scriptswitch v0.1.3

Super simple (and tiny, 684 bytes gzipped) conditional script loading manager for browsers and NodeJS.

Handles all the standard script attributes, e.g. `async`, `defer`, etc.

Supports asynchronous loading or sequenced synchronous loading for scripts that are dependent on other scripts.

# Installation

`npm install scriptswitch`

Use the file `scriptswitch.js` in the browser directory for browsers.

```javascript
<script src="scriptswitch.js"></script>
```

Use regular NodeJS syntax for NodeJS:

```javascript
const scriptswitch = require("scriptswitch");
```

# Usage

For browsers, just pass a dynamically built configuration object into `scriptswitch`. Each property should be a path to a script file. If the value is `null`, the script will not be loaded. Otherwise, the configuration options you provide will be used to
load the script.

```javascript
scriptswitch({
	"core.js": {
		async:false
	},
	"patches.js": (ev) => {
		if(<some condition under which patches are needed>) {
			return {
				async:false,
				onload:() => console.warn(`Had to load ${ev.target.src}`)
			}
		}
		return null;
	},
	"lazyloads.js": {
		async: true
	},
	"secondary.js": {}; // assumes standard loading, i.e. async:false
})
```

The `async:false` scripts complete loading in the order provided. Other scripts will complete laoding based on size, network performance, etc.

`scriptswitch` returns an array of `Promise` for all the loading scripts, i.e:

```javascript
Promise.all(scriptswitch(<config object>)).then(arrayOfScriptDOMElements => ...);
```

For NodeJS, provide an additional options argument `{scope:<usually 'this'>}` and for each script add a property `as` with the value being the variable to which you would like the script export bound, e.g.

```javascript
scriptswitch({
		"util": {
			as:"u"; // same as 'var u = require("util")'
		}
	},
	{scope:this})
```

Under the hood, all NodeJS scripts load synchronously; however, those marked as `async:true` will fire their `onload` event handlers asynchronously.

# Release History (reverse chronological order)

2018-08-06 v0.1.3 Added NodeJS support.

2018-08-06 v0.1.2 Added support for older browsers not having Promises.

2018-08-05 v0.1.1 Documentation enhancements.

2018-08-05 v0.1.0 First public release.

# License

MIT License

Copyright (c) 2018 Simon Y. Blackwell, AnyWhichWay, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.