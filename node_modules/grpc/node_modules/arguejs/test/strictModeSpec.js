define(['argue', 'chai'], function(__, chai) {"use strict";
  chai.Assertion.includeStack = true;
  var should = chai.should();
  var expect = chai.expect;
  
  if( ({}).toString.call(Function('return this')()).match(/\s([a-z|A-Z]+)/)[1] == 'DOMWindow')
    // skip stricMode tests if running in the unstable Phantomjs.
    return; 

  describe('strict mode', function() {

    it('should be activated now', function() {
      
      expect( (function () { return !this; })() ).to.be.true;
      expect( (function () { return !this; })() ).to.be.true;
      
    });    
    it('should not allow arguments catch', function() {
        
      (function(){
        return arguments.callee;
      }).should.throw(/.*calle.*strict mode.*/);
          
    });
    it('should allow to bypass global restriction', function() {
          
      should.equal( (function () {
        return !Function('return this')();
      })(), false);
          
    });
    it('should not allow arguejs to catch arguments', function() {
       
      function upper() {
        return __({});
      }
      
      (function(){
        upper();
      }).should.throw('It is not possible to infer arguments in strict mode. See http://github.com/zvictor/ArgueJs#propagating-arguments for alternatives.');
       
    });
    it('should allow arguejs to catch declared arguments', function() {
      
      function upper() {
        return __({foo: String}, arguments);
      }
      
      should.equal(upper('bar').foo, 'bar');
      
    });
    
  });
});
