define(['argue', 'chai'], function(__, chai) {
  chai.Assertion.includeStack = true;
  var should = chai.should();
  
  describe('data types', function() {
    
    describe('typage restriction', function() {
      
      it('should enforce String typed signature', function() {
        function upper() {
          return __({param: String});
        }
        
        //right:
        should.equal(upper("value").param, "value");
        
        //wrong:
        (function(){
          upper();
        }).should.throw("parameter 'param' waiting for String argument but received Undefined");
                
        (function(){
          upper(undefined);
        }).should.throw("parameter 'param' waiting for String argument but received Undefined");
        
        (function(){
          upper(null);
        }).should.throw("parameter 'param' waiting for String argument but received Null");
                
        (function(){
          upper(window);
        }).should.throw("parameter 'param' waiting for String argument but received global");
        
        (function(){
          upper(arguments);
        }).should.throw("parameter 'param' waiting for String argument but received Arguments");
        
        (function(){
          upper(7);
        }).should.throw("parameter 'param' waiting for String argument but received Number");
        
        (function(){
          upper(true);
        }).should.throw("parameter 'param' waiting for String argument but received Boolean");
        
        (function(){
          upper([]);
        }).should.throw("parameter 'param' waiting for String argument but received Array");
        
        (function(){
          upper(function(){});
        }).should.throw("parameter 'param' waiting for String argument but received Function");
        
        (function(){
          upper({key:"value"});
        }).should.throw("parameter 'param' waiting for String argument but received Object");
        
        (function(){
          upper(new Date());
        }).should.throw("parameter 'param' waiting for String argument but received Date");
        
        (function(){
          upper(new RegExp());
        }).should.throw("parameter 'param' waiting for String argument but received RegExp");

      });

      it('should enforce Number typed signature', function() {
        function upper() {
          return __({param: Number});
        }
        
        //right:
        should.equal(upper(7).param, 7);
        
        //wrong:
        (function(){
          upper();
        }).should.throw("parameter 'param' waiting for Number argument but received Undefined");
                
        (function(){
          upper(undefined);
        }).should.throw("parameter 'param' waiting for Number argument but received Undefined");
        
        (function(){
          upper(null);
        }).should.throw("parameter 'param' waiting for Number argument but received Null");
                
        (function(){
          upper(window);
        }).should.throw("parameter 'param' waiting for Number argument but received global");
        
        (function(){
          upper(arguments);
        }).should.throw("parameter 'param' waiting for Number argument but received Arguments");
        
        (function(){
          upper("value");
        }).should.throw("parameter 'param' waiting for Number argument but received String");
        
        (function(){
          upper(true);
        }).should.throw("parameter 'param' waiting for Number argument but received Boolean");
        
        (function(){
          upper([]);
        }).should.throw("parameter 'param' waiting for Number argument but received Array");
        
        (function(){
          upper(function(){});
        }).should.throw("parameter 'param' waiting for Number argument but received Function");
        
        (function(){
          upper({key:"value"});
        }).should.throw("parameter 'param' waiting for Number argument but received Object");
        
        (function(){
          upper(new Date());
        }).should.throw("parameter 'param' waiting for Number argument but received Date");
        
        (function(){
          upper(new RegExp());
        }).should.throw("parameter 'param' waiting for Number argument but received RegExp");
        
      });

      it('should enforce Boolean typed signature', function() {
        function upper() {
          return __({param: Boolean});
        }
        
        //right:
        should.equal(upper(true).param, true);
        
        //wrong:
        (function(){
          upper();
        }).should.throw("parameter 'param' waiting for Boolean argument but received Undefined");
                
        (function(){
          upper(undefined);
        }).should.throw("parameter 'param' waiting for Boolean argument but received Undefined");
        
        (function(){
          upper(null);
        }).should.throw("parameter 'param' waiting for Boolean argument but received Null");
                
        (function(){
          upper(window);
        }).should.throw("parameter 'param' waiting for Boolean argument but received global");
        
        (function(){
          upper(arguments);
        }).should.throw("parameter 'param' waiting for Boolean argument but received Arguments");
        
        (function(){
          upper("value");
        }).should.throw("parameter 'param' waiting for Boolean argument but received String");
        
        (function(){
          upper(7);
        }).should.throw("parameter 'param' waiting for Boolean argument but received Number");
        
        (function(){
          upper([]);
        }).should.throw("parameter 'param' waiting for Boolean argument but received Array");
        
        (function(){
          upper(function(){});
        }).should.throw("parameter 'param' waiting for Boolean argument but received Function");
        
        (function(){
          upper({key:"value"});
        }).should.throw("parameter 'param' waiting for Boolean argument but received Object");
        
        (function(){
          upper(new Date());
        }).should.throw("parameter 'param' waiting for Boolean argument but received Date");
        
        (function(){
          upper(new RegExp());
        }).should.throw("parameter 'param' waiting for Boolean argument but received RegExp");
        
      });

      it('should enforce Array typed signature', function() {
        function upper() {
          return __({param: Array});
        }
        
        //right:
        upper([]).param.should.eql([]);
        
        
        //wrong:
        (function(){
          upper();
        }).should.throw("parameter 'param' waiting for Array argument but received Undefined");
                
        (function(){
          upper(undefined);
        }).should.throw("parameter 'param' waiting for Array argument but received Undefined");
        
        (function(){
          upper(null);
        }).should.throw("parameter 'param' waiting for Array argument but received Null");
                
        (function(){
          upper(window);
        }).should.throw("parameter 'param' waiting for Array argument but received global");
        
        (function(){
          upper(arguments);
        }).should.throw("parameter 'param' waiting for Array argument but received Arguments");
          
        (function(){
          upper("value");
        }).should.throw("parameter 'param' waiting for Array argument but received String");
        
        (function(){
          upper(7);
        }).should.throw("parameter 'param' waiting for Array argument but received Number");
        
        (function(){
          upper(true);
        }).should.throw("parameter 'param' waiting for Array argument but received Boolean");
        
        (function(){
          upper(function(){});
        }).should.throw("parameter 'param' waiting for Array argument but received Function");
        
        (function(){
          upper({key:"value"});
        }).should.throw("parameter 'param' waiting for Array argument but received Object");
        
        (function(){
          upper(new Date());
        }).should.throw("parameter 'param' waiting for Array argument but received Date");
        
        (function(){
          upper(new RegExp());
        }).should.throw("parameter 'param' waiting for Array argument but received RegExp");
        
      });

      it('should enforce Function typed signature', function() {
        function upper() {
          return __({param: Function});
        }
        
        var fn = function(){};
        
        //right:
        should.equal(upper(fn).param, fn);
        
        //wrong:
        (function(){
          upper();
        }).should.throw("parameter 'param' waiting for Function argument but received Undefined");
                
        (function(){
          upper(undefined);
        }).should.throw("parameter 'param' waiting for Function argument but received Undefined");
        
        (function(){
          upper(null);
        }).should.throw("parameter 'param' waiting for Function argument but received Null");
                
        (function(){
          upper(window);
        }).should.throw("parameter 'param' waiting for Function argument but received global");
        
        (function(){
          upper(arguments);
        }).should.throw("parameter 'param' waiting for Function argument but received Arguments");
          
        (function(){
          upper("value");
        }).should.throw("parameter 'param' waiting for Function argument but received String");
        
        (function(){
          upper(7);
        }).should.throw("parameter 'param' waiting for Function argument but received Number");
        
        (function(){
          upper(true);
        }).should.throw("parameter 'param' waiting for Function argument but received Boolean");
        
        (function(){
          upper([]);
        }).should.throw("parameter 'param' waiting for Function argument but received Array");
        
        (function(){
          upper({key:"value"});
        }).should.throw("parameter 'param' waiting for Function argument but received Object");
        
        (function(){
          upper(new Date());
        }).should.throw("parameter 'param' waiting for Function argument but received Date");
        
        (function(){
          upper(new RegExp());
        }).should.throw("parameter 'param' waiting for Function argument but received RegExp");
        
      });

      it('should enforce Object typed signature', function() {
        function upper() {
          return __({param: Object});
        }
        
        //right:
        upper({key:"value"}).param.should.eql({key:"value"});
        
        //wrong:
        (function(){
          upper();
        }).should.throw("parameter 'param' waiting for Object argument but received Undefined");
                
        (function(){
          upper(undefined);
        }).should.throw("parameter 'param' waiting for Object argument but received Undefined");
        
        (function(){
          upper(null);
        }).should.throw("parameter 'param' waiting for Object argument but received Null");
                
        (function(){
          upper(window);
        }).should.throw("parameter 'param' waiting for Object argument but received global");
        
        (function(){
          upper(arguments);
        }).should.throw("parameter 'param' waiting for Object argument but received Arguments");
          
        (function(){
          upper("value");
        }).should.throw("parameter 'param' waiting for Object argument but received String");
        
        (function(){
          upper(7);
        }).should.throw("parameter 'param' waiting for Object argument but received Number");
        
        (function(){
          upper(true);
        }).should.throw("parameter 'param' waiting for Object argument but received Boolean");
        
        (function(){
          upper([]);
        }).should.throw("parameter 'param' waiting for Object argument but received Array");
        
        (function(){
          upper(function(){});
        }).should.throw("parameter 'param' waiting for Object argument but received Function");
        
        (function(){
          upper(new Date());
        }).should.throw("parameter 'param' waiting for Object argument but received Date");
        
        (function(){
          upper(new RegExp());
        }).should.throw("parameter 'param' waiting for Object argument but received RegExp");
        
      });

      it('should enforce Date typed signature', function() {
        function upper() {
          return __({param: Date});
        }
        var dt = new Date();
        
        //right:
        should.equal(upper(dt).param, dt);
        
        //wrong:
        (function(){
          upper();
        }).should.throw("parameter 'param' waiting for Date argument but received Undefined");
                  
        (function(){
          upper(undefined);
        }).should.throw("parameter 'param' waiting for Date argument but received Undefined");
        
        (function(){
          upper(null);
        }).should.throw("parameter 'param' waiting for Date argument but received Null");
                
        (function(){
          upper(window);
        }).should.throw("parameter 'param' waiting for Date argument but received global");
        
        (function(){
          upper(arguments);
        }).should.throw("parameter 'param' waiting for Date argument but received Arguments");
        
        (function(){
          upper("value");
        }).should.throw("parameter 'param' waiting for Date argument but received String");
        
        (function(){
          upper(7);
        }).should.throw("parameter 'param' waiting for Date argument but received Number");
        
        (function(){
          upper(true);
        }).should.throw("parameter 'param' waiting for Date argument but received Boolean");
        
        (function(){
          upper([]);
        }).should.throw("parameter 'param' waiting for Date argument but received Array");
        
        (function(){
          upper(function(){});
        }).should.throw("parameter 'param' waiting for Date argument but received Function");
        
        (function(){
          upper({key:"value"});
        }).should.throw("parameter 'param' waiting for Date argument but received Object");
        
        (function(){
          upper(new RegExp());
        }).should.throw("parameter 'param' waiting for Date argument but received RegExp");
        
      });


      it('should enforce RegExp typed signature', function() {
        function upper() {
          return __({param: RegExp});
        }
        
        //right:
        upper(new RegExp()).param.should.eql( new RegExp());
        
        //wrong:
        (function(){
          upper();
        }).should.throw("parameter 'param' waiting for RegExp argument but received Undefined");
                
        (function(){
          upper(undefined);
        }).should.throw("parameter 'param' waiting for RegExp argument but received Undefined");
        
        (function(){
          upper(null);
        }).should.throw("parameter 'param' waiting for RegExp argument but received Null");
                
        (function(){
          upper(window);
        }).should.throw("parameter 'param' waiting for RegExp argument but received global");
        
        (function(){
          upper(arguments);
        }).should.throw("parameter 'param' waiting for RegExp argument but received Arguments");
          
        (function(){
          upper("value");
        }).should.throw("parameter 'param' waiting for RegExp argument but received String");
        
        (function(){
          upper(7);
        }).should.throw("parameter 'param' waiting for RegExp argument but received Number");
        
        (function(){
          upper(true);
        }).should.throw("parameter 'param' waiting for RegExp argument but received Boolean");
        
        (function(){
          upper([]);
        }).should.throw("parameter 'param' waiting for RegExp argument but received Array");
        
        (function(){
          upper(function(){});
        }).should.throw("parameter 'param' waiting for RegExp argument but received Function");
        
        (function(){
          upper({key:"value"});
        }).should.throw("parameter 'param' waiting for RegExp argument but received Object");
        
        (function(){
          upper(new Date());
        }).should.throw("parameter 'param' waiting for RegExp argument but received Date");
        
      });

    });
    
  });
});
