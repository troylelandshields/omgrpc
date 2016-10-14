define(['argue', 'chai'], function(__, chai) {
  chai.Assertion.includeStack = true;
  var should = chai.should();

  describe('special data types', function() {

    describe('typage restriction', function() {

      it('should allow no argument values for undefined typed param', function() {
        function upper() {
          return __({param: undefined});
        }

        (function(){
          upper();
        }).should.throw("unsupported parameter type undefined");
        (function(){
          upper(undefined);
        }).should.throw("unsupported parameter type undefined");
        (function(){
          upper(null);
        }).should.throw("unsupported parameter type undefined");

      });

      it('should allow any argument values for null typed param', function() {
        function upper() {
          return __({param: null});
        }

        //right [accept all!]:
        should.equal(upper().param, undefined);
        should.equal(upper(undefined).param, undefined);
        should.equal(upper(null).param, null);
        should.equal(upper(window).param, window);
        should.equal(upper(arguments).param, arguments);

        should.equal(upper("value").param, "value");
        should.equal(upper(7).param, 7);
        should.equal(upper(true).param, true);
        upper([]).param.should.eql([]);
        var fn = function(){};
        should.equal(upper(fn).param, fn);
        upper({key:"value"}).param.should.eql({key:"value"});
        var dt = new Date()
        should.equal(upper(dt).param, dt);
        upper(new RegExp()).param.should.eql( new RegExp());

      });


      it('should enforce __.type.Arguments typed signature', function() {
        function upper() {
          return __({param: __.type.Arguments});
        }

        //right:
        upper(arguments).param.should.eql( arguments );

        //wrong:
        (function(){
          upper();
        }).should.throw("parameter 'param' waiting for Arguments argument but received Undefined");

        (function(){
          upper(undefined);
        }).should.throw("parameter 'param' waiting for Arguments argument but received Undefined");

        (function(){
          upper(null);
        }).should.throw("parameter 'param' waiting for Arguments argument but received Null");

        (function(){
          upper(window);
        }).should.throw("parameter 'param' waiting for Arguments argument but received global");

        (function(){
          upper("value");
        }).should.throw("parameter 'param' waiting for Arguments argument but received String");

        (function(){
          upper(7);
        }).should.throw("parameter 'param' waiting for Arguments argument but received Number");

        (function(){
          upper(true);
        }).should.throw("parameter 'param' waiting for Arguments argument but received Boolean");

        (function(){
          upper([]);
        }).should.throw("parameter 'param' waiting for Arguments argument but received Array");

        (function(){
          upper(function(){});
        }).should.throw("parameter 'param' waiting for Arguments argument but received Function");

        (function(){
          upper({key:"value"});
        }).should.throw("parameter 'param' waiting for Arguments argument but received Object");

        (function(){
          upper(new Date());
        }).should.throw("parameter 'param' waiting for Arguments argument but received Date");

        (function(){
          upper(new RegExp());
        }).should.throw("parameter 'param' waiting for Arguments argument but received RegExp");

      });

      it('should enforce Arguments typed signature', function() {
        function upper() {
          return __({param: "Arguments"});
        }

        //right:
        upper(arguments).param.should.eql( arguments );

        //wrong:
        (function(){
          upper();
        }).should.throw("parameter 'param' waiting for Arguments argument but received Undefined");

        (function(){
          upper(undefined);
        }).should.throw("parameter 'param' waiting for Arguments argument but received Undefined");

        (function(){
          upper(null);
        }).should.throw("parameter 'param' waiting for Arguments argument but received Null");

        (function(){
          upper(window);
        }).should.throw("parameter 'param' waiting for Arguments argument but received global");

        (function(){
          upper("value");
        }).should.throw("parameter 'param' waiting for Arguments argument but received String");

        (function(){
          upper(7);
        }).should.throw("parameter 'param' waiting for Arguments argument but received Number");

        (function(){
          upper(true);
        }).should.throw("parameter 'param' waiting for Arguments argument but received Boolean");

        (function(){
          upper([]);
        }).should.throw("parameter 'param' waiting for Arguments argument but received Array");

        (function(){
          upper(function(){});
        }).should.throw("parameter 'param' waiting for Arguments argument but received Function");

        (function(){
          upper({key:"value"});
        }).should.throw("parameter 'param' waiting for Arguments argument but received Object");

        (function(){
          upper(new Date());
        }).should.throw("parameter 'param' waiting for Arguments argument but received Date");

        (function(){
          upper(new RegExp());
        }).should.throw("parameter 'param' waiting for Arguments argument but received RegExp");

      });

    });
  });

});