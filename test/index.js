var chai,
	expect,
	scriptswitch;

//if(typeof(module)!=="undefined") {
//	scriptswitch = require("../index.js");
//}

console.log("Testing ...");

describe("all tests",function() {
	it("regular synchronous load",function(done) {
		const promises = scriptswitch({
			"script1.js":{onload:(ev) => {
					expect(script1).equal(true);
					expect(promises.length).equal(1);
					Promise.all(promises).then(scripts => {
						expect(scripts[0]).equal(ev.target);
						done();
					});
				}
			}
		})
	});
	it("regular asynchronous load",function(done) {
		const promises = scriptswitch({
			"script1.js":{
				async:true,
				onload:(ev) => {
					expect(script1).equal(true);
					expect(promises.length).equal(1);
					expect(ev.target.getAttribute("async")).equal("true");
					Promise.all(promises).then(scripts => {
						expect(scripts[0]).equal(ev.target);
						done();
					});
				}
			}
		})
	});
	it("sequenced load",function(done) {
		const promises = scriptswitch({
			"script1.js":{async:false},
			"script2.js":{
				async:false,
				onload:(ev) => {
					expect(script1).equal(false);
					expect(script2).equal(true);
					expect(promises.length).equal(2);
					Promise.all(promises).then(scripts => {
						expect(scripts[1]).equal(ev.target);
						done();
					});
				}
			}
		})
	});
	it("no load",function(done) {
		const promises = scriptswitch({
			"script1.js":null,
			"script2.js":null
		});
		expect(promises.length).equal(0);
		done();
	});
});


if(typeof(window)!=="undefined") {
	mocha.run();
}
		
		



