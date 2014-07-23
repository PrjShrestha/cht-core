describe('Form service', function() {

  'use strict';

  var service,
      results,
      language = 'en',
      $translateProvider,
      $rootScope;

  beforeEach(function (){
    module('inboxApp');
    module(function ($provide) {
      $provide.value('Settings', {
        query: function(callback) {
          callback( { settings: { forms: results } } );
        }
      });
    });
    module(function ($provide) {
      $provide.value('Language', {
        get: function() {
          return {
            then: function(callback) {
              callback(language);
            }
          };
        }
      });
    });
    inject(function(_Form_, _$rootScope_, _$translate_) {
      $rootScope = _$rootScope_;
      $translateProvider = _$translate_;
      service = _Form_;
    });
  });

  it('returns zero when no forms', function(done) {

    results = {};
    var expected = [];

    service.get().then(
      function(actual) {
        chai.expect(actual).to.deep.equal(expected);
        done();
      }
    );

    // needed to resolve the promise
    $rootScope.$digest();
  });

  it('returns forms with old style labels', function(done) {

    results = {
      A: { meta: { code: 'A', label: 'First'  } },
      B: { meta: { code: 'B', label: 'Second' } },
      C: { meta: { code: 'C', label: 'Third'  } },
      D: { meta: { code: 'D', label: 'Fourth' } }
    };
    var expected = [
      { code: 'A', name: 'First'  },
      { code: 'D', name: 'Fourth' },
      { code: 'B', name: 'Second' },
      { code: 'C', name: 'Third'  }
    ];

    service.get().then(
      function(actual) {
        chai.expect(actual).to.deep.equal(expected);
        done();
      }
    );

    $rootScope.$digest();
  });

  it('returns forms with code if no label', function(done) {

    results = {
      A: { meta: { code: 'A' } },
      B: { meta: { code: 'B' } },
      C: { meta: { code: 'C', label: 'Third' } },
      D: { meta: { code: 'D' } }
    };
    var expected = [
      { code: 'A', name: 'A' },
      { code: 'B', name: 'B' },
      { code: 'D', name: 'D' },
      { code: 'C', name: 'Third' }
    ];

    service.get().then(
      function(actual) {
        chai.expect(actual).to.deep.equal(expected);
        done();
      }
    );

    $rootScope.$digest();
  });

  it('returns forms with translated label', function(done) {

    results = {
      A: { meta: { code: 'A', label: { en: 'First',  sw: 'tsriF'  } } },
      B: { meta: { code: 'B', label: { en: 'Second', sw: 'dnoceS' } } },
      C: { meta: { code: 'C', label: { en: 'Third',  sw: 'drihT'  } } },
      D: { meta: { code: 'D', label: { en: 'Fourth', sw: 'htruoF' } } }
    };
    var expected = [
      { code: 'B', name: 'dnoceS' },
      { code: 'C', name: 'drihT'  },
      { code: 'D', name: 'htruoF' },
      { code: 'A', name: 'tsriF'  }
    ];

    language = 'sw';

    service.get().then(
      function(actual) {
        chai.expect(actual).to.deep.equal(expected);
        done();
      }
    );

    $rootScope.$digest();
  });

});