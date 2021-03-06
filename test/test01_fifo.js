
// external dependencies
var expect = require('chai').expect;
var path = require('path');
var proxyquire = require('proxyquire');

var utils = require('./utils/utils');

// config
var moduleName = path.basename(__filename);

// funcs
var print = function(msg){
	return console.log(moduleName + ' [TESTRUN] >> ' + msg);
};

// data
var loadFunction = utils.loadFunc;

// target
var dirLevelUp = '../';
var unit = require(dirLevelUp + 'index.js');

// flow
describe(moduleName + '>> fifo', function(){
	
	var cacheObj;
	
	before(function(done){
		
		print('init - start...');
		print('init - typeof st = ' + typeof('fifo'));
		
		cacheObj = new unit({
			size: 5, // 5 records max
			ttl: 2, // 2 second
			interval: 1, // 1 second
			strategy: 'fifo', // First in first out
			load: loadFunction // Where to get missing data
		});
		
		print('init - cacheObj.count = ' + cacheObj.count());
		//expect(cacheObj.count(), `int >> Expected cacheObj.count to equal 0`).to.equal(0);
		
		done();
		
	});
	it('access few', function(done){
		
		print('access few - start...');
		
		cacheObj.get("1", function(err, result){
			
			print('access few - 1 callback...');
			print('access few - 1 cacheObj.count = ' + cacheObj.count());
			expect(cacheObj.count()).to.equal(1);
			
			expect(result.name).to.equal("dummy1");
			
			cacheObj.get("2", function(err, resultB){
				
				print('access few - 2 callback...');
				print('access few - 2 cacheObj.count = ' + cacheObj.count());
				
				expect(cacheObj.count()).to.equal(2);
				expect(resultB.name).to.equal("dummy2");
				done();
			});
		});
	});
	it('access overflow', function(done){
		
		print('access overflow - start = ' + cacheObj.count());
		
		for(var x=1; x<=20; x++){
			cacheObj.get(x.toString(), function(){});
		}
		
		print('access overflow - insert = ' + cacheObj.count());
		
		setTimeout(function(){
			print('access overflow - keys = ' + JSON.stringify(cacheObj.keys()) );
			expect(cacheObj.count()).to.equal(5);
			
			var lastObj = cacheObj.tail();
			print('access overflow - last = ' + JSON.stringify(lastObj) );
			expect(lastObj.name).to.equal("dummy20");
			var firstObj = cacheObj.head();
			expect(firstObj.name).to.equal("dummy16");
			
			done();
		
		}, 50);
		
	});
	it('wait for expiery', function(done){
		this.timeout(4000);
		
		print('fifo - stats - start = ' + JSON.stringify(cacheObj.stats()) );
		
		setTimeout(function(){
			
			expect(cacheObj.count()).to.equal(0);
			
			print('fifo - stats - end = ' + JSON.stringify(cacheObj.stats()) );
			done();
		}, 3050);
	});
});


