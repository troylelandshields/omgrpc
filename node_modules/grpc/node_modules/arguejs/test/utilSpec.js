define(['argue', 'chai'], function(__, chai) {
  chai.Assertion.includeStack = true;
  var should = chai.should();
  var expect = chai.expect;

  describe('utilities', function() {

    describe('getType', function() {

      it('gives us the right types', function() {

        //right [accept all!]:
        should.equal(__.getType( undefined ), undefined);
        should.equal(__.getType( null ), null);

        should.equal(__.getType( window ), __.type.global);
        should.equal(__.getType( arguments ), __.type.Arguments);

        should.equal(__.getType( "value" ), String);
        should.equal(__.getType( 7 ), Number);
        should.equal(__.getType( true ), Boolean);
        should.equal(__.getType( [] ), Array);
        should.equal(__.getType( function(){} ), Function);
        should.equal(__.getType( {key:"value"}), Object);
        should.equal(__.getType( new Date()), Date);
        should.equal(__.getType( new RegExp()), RegExp);

      });

    });

    describe('typeof', function() {

      it('gives us the right names', function() {

        //right [accept all!]:
        should.equal(__.typeof( undefined ), "Undefined");
        should.equal(__.typeof( null ), "Null");

        should.equal(__.typeof( window ), "global");
        should.equal(__.typeof( arguments ), "Arguments");

        should.equal(__.typeof( "value" ), "String");
        should.equal(__.typeof( 7 ), "Number");
        should.equal(__.typeof( true ), "Boolean");
        should.equal(__.typeof( [] ), "Array");
        should.equal(__.typeof( function(){} ), "Function");
        should.equal(__.typeof( {key:"value"}), "Object");
        should.equal(__.typeof( new Date()), "Date");
        should.equal(__.typeof( new RegExp()), "RegExp");

      });

    });

    describe('belongs', function() {

      it('should not accept Null and Undefined types', function() {
        //right:
        expect(__.belongs(undefined, undefined)).to.be.true;
        expect(__.belongs(null, undefined)).to.be.false;
        expect(__.belongs(undefined, null)).to.be.false;
        expect(__.belongs(null, null)).to.be.true;

      });

      it('should check when a instance is String typed', function() {
        //right:
        expect(__.belongs("value", String)).to.be.true;

        //wrong:
        expect(__.belongs(undefined, String)).to.be.false;
        expect(__.belongs(null, String)).to.be.false;
        expect(__.belongs(window, String)).to.be.false;
        expect(__.belongs(arguments, String)).to.be.false;
        expect(__.belongs(7, String)).to.be.false;
        expect(__.belongs(true, String)).to.be.false;
        expect(__.belongs([], String)).to.be.false;
        expect(__.belongs(function(){}, String)).to.be.false;
        expect(__.belongs({key:"value"}, String)).to.be.false;
        expect(__.belongs(new Date(), String)).to.be.false;
        expect(__.belongs(new RegExp(), String)).to.be.false;

      });

      it('should check when a instance is Number typed', function() {
        //right:
        expect(__.belongs(7, Number)).to.be.true;

        //wrong:
        expect(__.belongs(undefined, Number)).to.be.false;
        expect(__.belongs(null, Number)).to.be.false;
        expect(__.belongs(window, Number)).to.be.false;
        expect(__.belongs(arguments, Number)).to.be.false;
        expect(__.belongs("value", Number)).to.be.false;
        expect(__.belongs(true, Number)).to.be.false;
        expect(__.belongs([], Number)).to.be.false;
        expect(__.belongs(function(){}, Number)).to.be.false;
        expect(__.belongs({key:"value"}, Number)).to.be.false;
        expect(__.belongs(new Date(), Number)).to.be.false;
        expect(__.belongs(new RegExp(), Number)).to.be.false;

      });

      it('should check when a instance is Boolean typed', function() {
        //right:
        expect(__.belongs(true, Boolean)).to.be.true;

        //wrong:
        expect(__.belongs(undefined, Boolean)).to.be.false;
        expect(__.belongs(null, Boolean)).to.be.false;
        expect(__.belongs(window, Boolean)).to.be.false;
        expect(__.belongs(arguments, Boolean)).to.be.false;
        expect(__.belongs("value", Boolean)).to.be.false;
        expect(__.belongs(7, Boolean)).to.be.false;
        expect(__.belongs([], Boolean)).to.be.false;
        expect(__.belongs(function(){}, Boolean)).to.be.false;
        expect(__.belongs({key:"value"}, Boolean)).to.be.false;
        expect(__.belongs(new Date(), Boolean)).to.be.false;
        expect(__.belongs(new RegExp(), Boolean)).to.be.false;

      });

      it('should check when a instance is Array typed', function() {
        //right:
        expect(__.belongs([], Array)).to.be.true;


        //wrong:
        expect(__.belongs(undefined, Array)).to.be.false;
        expect(__.belongs(null, Array)).to.be.false;
        expect(__.belongs(window, Array)).to.be.false;
        expect(__.belongs(arguments, Array)).to.be.false;
        expect(__.belongs("value", Array)).to.be.false;
        expect(__.belongs(7, Array)).to.be.false;
        expect(__.belongs(true, Array)).to.be.false;
        expect(__.belongs(function(){}, Array)).to.be.false;
        expect(__.belongs({key:"value"}, Array)).to.be.false;
        expect(__.belongs(new Date(), Array)).to.be.false;
        expect(__.belongs(new RegExp(), Array)).to.be.false;

      });

      it('should check when a instance is Function typed', function() {
        //right:
        expect(__.belongs(function(){}, Function)).to.be.true;

        //wrong:
        expect(__.belongs(undefined, Function)).to.be.false;
        expect(__.belongs(null, Function)).to.be.false;
        expect(__.belongs(window, Function)).to.be.false;
        expect(__.belongs(arguments, Function)).to.be.false;
        expect(__.belongs("value", Function)).to.be.false;
        expect(__.belongs(7, Function)).to.be.false;
        expect(__.belongs(true, Function)).to.be.false;
        expect(__.belongs([], Function)).to.be.false;
        expect(__.belongs({key:"value"}, Function)).to.be.false;
        expect(__.belongs(new Date(), Function)).to.be.false;
        expect(__.belongs(new RegExp(), Function)).to.be.false;

      });

      it('should check when a instance is Object typed', function() {
        //right:
        expect(__.belongs({key:"value"}, Object)).to.be.true;

        //wrong:
        expect(__.belongs(undefined, Object)).to.be.false;
        expect(__.belongs(null, Object)).to.be.false;
        expect(__.belongs(window, Object)).to.be.false;
        expect(__.belongs(arguments, Object)).to.be.false;
        expect(__.belongs("value", Object)).to.be.false;
        expect(__.belongs(7, Object)).to.be.false;
        expect(__.belongs(true, Object)).to.be.false;
        expect(__.belongs([], Object)).to.be.false;
        expect(__.belongs(function(){}, Object)).to.be.false;
        expect(__.belongs(new Date(), Object)).to.be.false;
        expect(__.belongs(new RegExp(), Object)).to.be.false;

      });

      it('should check when a instance is Date typed', function() {
        //right:
        expect(__.belongs(new Date(), Date)).to.be.true;

        //wrong:
        expect(__.belongs(undefined, Date)).to.be.false;
        expect(__.belongs(null, Date)).to.be.false;
        expect(__.belongs(window, Date)).to.be.false;
        expect(__.belongs(arguments, Date)).to.be.false;
        expect(__.belongs("value", Date)).to.be.false;
        expect(__.belongs(7, Date)).to.be.false;
        expect(__.belongs(true, Date)).to.be.false;
        expect(__.belongs([], Date)).to.be.false;
        expect(__.belongs(function(){}, Date)).to.be.false;
        expect(__.belongs({key:"value"}, Date)).to.be.false;
        expect(__.belongs(new RegExp(), Date)).to.be.false;

      });


      it('should check when a instance is RegExp typed', function() {
        //right:
        expect(__.belongs(new RegExp(), RegExp)).to.be.true;

        //wrong:
        expect(__.belongs(undefined, RegExp)).to.be.false;
        expect(__.belongs(null, RegExp)).to.be.false;
        expect(__.belongs(window, RegExp)).to.be.false;
        expect(__.belongs(arguments, RegExp)).to.be.false;
        expect(__.belongs("value", RegExp)).to.be.false;
        expect(__.belongs(7, RegExp)).to.be.false;
        expect(__.belongs(true, RegExp)).to.be.false;
        expect(__.belongs([], RegExp)).to.be.false;
        expect(__.belongs(function(){}, RegExp)).to.be.false;
        expect(__.belongs({key:"value"}, RegExp)).to.be.false;
        expect(__.belongs(new Date(), RegExp)).to.be.false;

      });

    });


  });
});
