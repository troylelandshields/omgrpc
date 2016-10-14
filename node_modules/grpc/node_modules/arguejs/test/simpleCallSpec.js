define(['argue', 'chai'], function(__, chai) {
  chai.Assertion.includeStack = true;
  var should = chai.should();

  describe('simple calls', function() {

    describe('when arguments exceed', function() {

      it('should throw an Error when arguments exceed', function() {

        function upper() {
          return __({});
        }

        (function(){
          upper("value");
        }).should.throw('Too many arguments');

      });

    });

    describe('when a parameter name is numeric', function() {

      it('should throw an Error', function() {

        function upper() {
          return __({1:null});
        }

        (function(){
          upper("value");
        }).should.throw('NameError: a parameter name can not be numeric');

      });

      it('should throw an Error', function() {

        function upper() {
          return __({"1":null});
        }

        (function(){
          upper("value");
        }).should.throw('NameError: a parameter name can not be numeric');

      });

    });
    
    describe('without signature without upperArguments', function() {
      function upper() {
        return __();
      }

      it('should throw error when called', function() {
        
        (function(){
          upper();
        }).should.throw("parameter 'signature' waiting for Object argument but received Undefined");

      });

    });
    describe('without signature with upperArguments', function() {
      function upper() {
        return __(arguments);
      }

      it('should throw error when called', function() {

        (function(){
          upper();
        }).should.throw("parameter 'signature' waiting for Object argument but received Arguments");
        
      });

    });
    describe('with signature without upperArguments', function() {
      function upper() {
        return __({});
      }

      it('should return no arguments', function() {
        
        var instance = upper();

        instance.should.be.an('object');
        instance.should.have.ownProperty('doc');
        instance.doc.should.be.a('function');
        
        delete instance.doc
        instance.should.be.empty;

      });

    });
    describe('with signature with incompatible upperArguments', function() {
      function upper() {
        return __({}, true);
      }

      it('should throw error when called', function() {
        
        (function(){
          upper();
        }).should.throw("parameter 'upperArguments' waiting for Array or Arguments argument but received Boolean");

      });

    });
    describe('with signature with upperArguments', function() {
      function upper() {
        return __({foo: String}, arguments);
      }

      it('should have the same behavior as without upperArguments', function() {
        function upper2() {
          return __({foo: String});
        }
        
        should.equal(upper('bar').foo, upper2('bar').foo);
        
      });

    });

  });
});
