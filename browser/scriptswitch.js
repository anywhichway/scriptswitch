(function() {
	
	const scriptswitch = (scripts={}) => {
		const promises = [],
			asynchronous = [],
			synchronous = [],
			paths = Object.keys(scripts),
			me = document.getElementById("scriptswitch"),
			parent = me.parentNode;
	
		for(const path in scripts) {
			if(!scripts[path]) continue;
			let resolver;
			const spec = Object.assign({},scripts[path]),
				onload = spec.onload,
				promise = new Promise(resolve => resolver = resolve);
			promises.push(promise);
			spec.src = path;
			spec.script =  document.createElement("script");
			spec.onload = (ev) => {
				resolver(spec.script);
				if(onload) {
					onload(ev);
				}
			}
			if(spec.async) {
				asynchronous.push(spec);
			} else {
				synchronous.push(spec);
			}
		}
		function load(spec) {
			for(const key in spec) {
				if(key!=="next" && key!=="script") {
					const value = spec[key];
					if(value!=false) spec.script.setAttribute(key,value);
				}
			}
			spec.script.onload = spec.onload;
			if(spec.next) {
				const onload = spec.onload;
				spec.script.onload = (ev) => {
					onload.call(spec.script,ev);
					load(spec.next);
				}
			}
			parent.insertBefore(spec.script,me);
		}
	
		let spec = synchronous.shift(),
			next;
		const first = spec;
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

	