/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($, Zoomy) {

  /*
    ======== A Handy Little QUnit Reference ========
    http://docs.jquery.com/QUnit

    Test methods:
      expect(numAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      raises(block, [expected], [message])
  */

  module('Zoomy', {
    setup: function() {
      this.elems = $('.test-units').find('a');
      this.Zoomy = new Zoomy($('.test-units').find('a'), {}, 'click');
    }
  });

  test('is chainable', 1, function() {
    equal(this.elems.zoomy(), this.elems, 'should be chaninable');
  });

  test('Positioning values returning correct numbers', function(){
    expect(3);
    equal(this.Zoomy.Helpers('pos').stop(2,4,5,6), (2 - 4 - 5) + 6, 'should be the same');
    equal(this.Zoomy.Helpers('pos').mouse(2,4,5), 2 - 4 - 5, 'should be the same');
    equal(this.Zoomy.Helpers('pos').zoom(2,7,3,2,1), ((2 - 7) / 3) - 2 + 1, 'should be the same');
  });

  test('Compiling CSS', function(){
    equal(typeof this.Zoomy.Helpers('css'), 'function', 'should return a function');
    equal(typeof this.Zoomy.Helpers('css')(), 'object', 'should be an empty object');
    equal(this.Zoomy.Helpers('css')([1, 2, 3, 4]).backgroundPosition, '-1px -2px', 'should be compiled css object');
  });



}(jQuery, Zoomy));
