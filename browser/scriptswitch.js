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
	
	function scriptswitch(scripts) {
		scripts || (scripts={});
		var promises = [],
			asynchronous = [],
			synchronous = [],
			paths = Object.keys(scripts),
			me = document.getElementById("scriptswitch"),
			parent = me.parentNode;
	
		for(const path in scripts) {
			if(!scripts[path]) continue;
			promises.push(new Promise(function(resolve) {
				var spec = Object.assign({},scripts[path]),
					onload = spec.onload;
				spec.src = path;
				spec.script =  document.createElement("script");
				spec.onload = (ev) => {
					resolve(spec.script);
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
		function load(spec) {
			for(var key in spec) {
				if(key!=="next" && key!=="script") {
					var value = spec[key];
					if(value!=false) spec.script.setAttribute(key,value);
				}
			}
			spec.script.onload = spec.onload;
			if(spec.next) {
				var onload = spec.onload;
				spec.script.onload = (ev) => {
					onload.call(spec.script,ev);
					load(spec.next);
				}
			}
			parent.insertBefore(spec.script,me);
		}
	
		var spec = synchronous.shift(),
			next,
			first = spec;
		while(spec && (next = synchronous.shift())) {
			spec.next = next;
			spec = next;
		}
		if(first) {
			load(first);
		}
		while(spec = asynchronous.shift()) {
			load(spec);
		}
		return promises;
	}
	
	window.scriptswitch = scriptswitch;
}).call(this);

	