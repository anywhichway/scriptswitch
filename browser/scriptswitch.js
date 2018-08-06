// (c) Copyright AnyWhichWay LLC, Simon Y. Blackwell
// License: MIT
(function() {
	var Promise;
	if(typeof(Promise)==="undefined") {
		// https://gist.github.com/unscriptable/814052
		// matthieusieben commented on Aug 8, 2017
		function Promise (cb) {
		  var q = [], v, u, ok, complete = function (m, r) {
		    if (q) {
		      var i = -1, l = q;
		      ok = !m; v = r; q = null;
		      while (++i < l.length) l[i][m](v);
		    }
		  };
		  cb(complete.bind(u, 0), complete.bind(u, 1));
		  this.then = then;
		  this.catch = then.bind(u, u)
		  function then(success, error) {
		    return new Promise(function (resolve, reject) {
		      if (q) q.push([ done.bind(u, success), done.bind(u, error) ]);
		      else done(ok ? success : error);
		      function done (cb) { try {
		        var val = cb ? cb(v) : u;
		        if (val && val.then) val.then(resolve, reject);
		        else (cb || ok ? resolve : reject)(val);
		      } catch (e) { reject(e) } }
		    })
		  }
		}
	}
	
	var isBrowser = typeof(window)!=="undefined";
	
	function scriptswitch(scripts,{scope}={}) {
		scripts || (scripts={});
		var promises = [],
			asynchronous = [],
			synchronous = [],
			paths = Object.keys(scripts),
			me = isBrowser ? document.getElementById("scriptswitch") : null,
			parent = me ? me.parentNode  : null;
		function load(spec) {
			for(var key in spec) {
				if(key!=="script") {
					var value = spec[key];
					if(value!=false && isBrowser) spec.script.setAttribute(key,value);
				}
			}
			if(isBrowser) spec.script.onload = spec.onload;
			if(spec.next) {
				var onload = spec.onload;
				if(isBrowser) {
					spec.script.onload = (ev) => {
						onload.call(spec.script,ev);
						load(spec.next);
					}
				} else {
					if(onload) {
						onload({target:spec.next});
						load(spec.next);
					}
				}
			}
			if(isBrowser) {
				parent.insertBefore(spec.script,me); 
			} else if(spec.onload) {
				if(spec.async) setTimeout(() => spec.onload({target:spec})); // make it look async
				else spec.onload({target:spec});
			}
		}
		for(const path in scripts) {
			if(!scripts[path]) continue;
			promises.push(new Promise(function(resolve) {
				var spec = Object.assign({},scripts[path]),
					onload = spec.onload;
				spec.src = path;
				if(isBrowser) {
					spec.script =  document.createElement("script");
				} else {
					if(!scope) {
						throw new Error("'scope' is a required scriptswitch option for NodeJS use")
					}
					if(!spec.as) {
						throw new Error("'import' is a required script property for NodeJS use")
					}
					scope[spec.as] = require(require("path").resolve(__dirname,spec.src));
					spec.script = `${scope[spec.as]}`;
				}
				spec.onload = (ev) => {
					if(isBrowser) {
						resolve(spec.script);
					} else {
						resolve(spec);
					}
					if(onload) {
						onload(ev);
					}
				}
				if(spec.async) {
					asynchronous.push(spec);
				} else {
					synchronous.push(spec);
				}
			}));
		}
		var spec = synchronous.shift(),
			next,
			first = spec;
		while(spec && (next = synchronous.shift())) { // set synchronous to run in sequence
			Object.defineProperty(spec,"next",{value:next});
			spec = next;
		}
		if(first) {
			setTimeout(() => load(first)); // use timeout so promises can be returned
		}
		while(spec = asynchronous.shift()) {
			load(spec);
		}
		return promises;
	}
	
	if(typeof(module)!=="undefined") module.exports = scriptswitch;
	if(typeof(window)!=="undefined") window.scriptswitch = scriptswitch;
}).call(this);

	