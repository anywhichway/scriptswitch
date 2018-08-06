var chai,
	expect,
	scriptswitch,
	isNode = typeof(module)!=="undefined";

if(isNode) {
	scriptswitch = require("../index.js");
	chai = require("chai");
	expect = chai.expect;
}

console.log("Testing ...");

var script1, script2, scope = this;

describe("all tests",function() {
	it("regular synchronous load",function(done) {
		const promises = scriptswitch({
			[`${isNode ? "test/" : ""}script1.js`]:{
				onload:(ev) => {
					expect(scope.script1).equal(true);
					expect(promises.length).equal(1);
					Promise.all(promises).then(scripts => {
						expect(scripts[0]).equal(ev.target);
						done();
					});
				},
				as: "script1"
			}
		},{scope})
	});
	it("regular asynchronous load",function(done) {
		const promises = scriptswitch({
			[`${isNode ? "test/" : ""}script1.js`]:{
				async:true,
				onload:(ev) => {
					expect(scope.script1).equal(true);
					expect(promises.length).equal(1);
					if(isNode) {
						expect(ev.target.async).equal(true);
					} else {
						expect(ev.target.getAttribute("async")).equal("true");
					}
					Promise.all(promises).then(scripts => {
						expect(scripts[0]).equal(ev.target);
						done();
					});
				},
				as: "script1"
			}
		},{scope})
	});
	it("sequenced load",function(done) {
		script1 = false;
		const promises = scriptswitch({
			[`${isNode ? "test/" : ""}script1.js`]:{
				async:false,
				as: "script1"
			},
			[`${isNode ? "test/" : ""}script2.js`]:{
				async:false,
				onload:(ev) => {
					expect(scope.script1).equal(true);
					expect(scope.script2).equal(true);
					expect(promises.length).equal(2);
					Promise.all(promises).then(scripts => {
						expect(scripts[1]).equal(ev.target);
						done();
					});
				},
				as: "script2"
			}
		},{scope})
	});
	it("no load",function(done) {
		const promises = scriptswitch({
			[`${isNode ? "test/" : ""}script1.js`]:null,
			[`${isNode ? "test/" : ""}script2.js`]:null
		});
		expect(promises.length).equal(0);
		done();
	},{scope});
});


if(typeof(window)!=="undefined") {
	mocha.run();
}
		
		



