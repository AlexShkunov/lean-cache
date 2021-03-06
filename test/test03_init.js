
// external dependencies
var expect = require('chai').expect;
var path = require('path');
var proxyquire = require('proxyquire');

// config
var moduleName = path.basename(__filename);

// funcs
var print = function(msg){
	return console.log(moduleName + ' [TESTRUN] >> ' + msg);
};

// data
var storage = {};
for(var i=0; i<100; i++){
	storage[i.toString()] = { name:("dummy" + i) };
};
var loadFunction = function(id, cb){
	try{
		return cb(null, storage[id]);
	}
	catch(e){
		return cb(true, null);
	}
};

// target
var dirLevelUp = '../';
var unit = require(dirLevelUp + 'index.js');

// flow
/*
{
	size: 100000, // 100k records max
	ttl: (60 * 60), // 1 hour
	interval: 60, // 1 minute
	strategy: 'fifo', // First in first out
	load: null, // Where to get missing data
	storage: 'memory' // storage
};
*/
describe('size', function(){
	
	it('below', function(){
		
		print('size.below - start...');
		var catched = false;
		
		try{
			var test = new unit({
				size: -12
			});
		}
		catch(e){
			print('size.below - e = ' + JSON.stringify(e));
			catched = true;
		}
		
		expect(catched).to.be.true;
		
	});
	it('above', function(){
		
		var catched = false;
		
		try{
			var test = new unit({
				size: 10000000 // 10m
			});
		}
		catch(e){
			catched = true;
		}
		
		expect(catched).to.be.true;
	});
});
describe('ttl', function(){
	it('below', function(){
		var catched = false;
		
		try{
			var test = new unit({
				ttl: -12
			});
		}
		catch(e){
			catched = true;
		}
		
		expect(catched).to.be.true;
	});
	it('above', function(){
		var catched = false;
		
		try{
			var test = new unit({
				ttl: (2592000 + 1) // 30 days + 1 sec
			});
		}
		catch(e){
			catched = true;
		}
		
		expect(catched).to.be.true;
	});
});
describe('interval', function(){
	it('below', function(){
		var catched = false;
		
		try{
			var test = new unit({
				interval: -12
			});
		}
		catch(e){
			catched = true;
		}
		
		expect(catched).to.be.true;
	});
	it('above', function(){
		var catched = false;
		
		try{
			var test = new unit({
				interval: (86400 + 1) // 1 day + 1 sec
			});
		}
		catch(e){
			catched = true;
		}
		
		expect(catched).to.be.true;
	});
});
describe('strategy', function(){
	it('unknown', function(){
		var catched = false;
		
		try{
			var test = new unit({
				strategy: 'dummy'
			});
		}
		catch(e){
			print('strategy - err = ' + JSON.stringify(e));
			catched = true;
		}
		
		expect(catched).to.be.true;
	});
	it('neg.custom', function(){
		var catched = false;
		var custom = function(opts, storage){
			///nothing here on purpose
		};
		
		try{
			var test = new unit({
				size: 1,
				strategy: custom
			});
		}
		catch(e){
			print('neg.custom - err = ' + JSON.stringify(e));
			catched = true;
		}
		
		expect(catched).to.be.true;
		
	});
	it('custom', function(){
		var catched = false;
		var custom = function(opts, storage){
			
			this.opts = opts;
			var store = storage;
			
			this.set = function(key, obj){
				if(store.count >= this.opts.size){
					return false; //deny
				}
				// add to Tail
				store.add(key, obj);
			};
			
			this.get = function(){};
		};
		
		var test = new unit({
			size: 1,
			strategy: custom
		});
		
		test.set(1, 1);
		test.set(2, 2); // Custom implements None replacement strategy, the second is then denied
		
		var keys = test.keys();
		print('custom - keys = ' + JSON.stringify(keys));
		
		expect(keys.length).to.equal(1);
		expect(keys[0]).to.equal('1');
		
	});
});
describe('load', function(){
	it('string', function(){
		var catched = false;
		
		try{
			var test = new unit({
				load: 'blabla'
			});
		}
		catch(e){
			catched = true;
		}
		
		expect(catched).to.be.true;
	});
});

describe('storage', function(){
	it('dummy', function(){
		
		var catched = false;
		
		try{
			var test = new unit({
				storage: 'blabla'
			});
		}
		catch(e){
			catched = true;
		}
		
		expect(catched).to.be.true;
	});
	it('conflict node-lru', function(){
		
		var catched = false;
		
		try{
			var test = new unit({
				storage: 'node-cache',
				strategy: 'lru'
			});
		}
		catch(e){
			catched = true;
		}
		
		expect(catched).to.be.true;
	});
});


