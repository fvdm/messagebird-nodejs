var dotest = require('dotest');
var path = require('path');
var app = require(path.resolve(__dirname, '..'));

var accessKey = process.env.MB_ACCESSKEY || '';
var accessType = accessKey.split('_')[0].toUpperCase();
var timeout = process.env.MB_TIMEOUT || 5000;
var number = parseInt(process.env.MB_NUMBER, 10);

var messagebird = app(accessKey, timeout);

var cache = {
  textMessage: {
    originator: 'node-js',
    recipients: [number],
    type: 'sms',
    body: 'Test message from node ' + process.version,
    gateway: 2
  },

  voiceMessage: {
    originator: 'node-js',
    recipients: [number],
    body: 'Hello, this is a test message from node version ' + process.version,
    language: 'en-gb',
    voice: 'female',
    repeat: 1,
    ifMachine: 'continue'
  },

  hlr: {},

  verify: {
    recipient: number
  },

  lookup: {
    phoneNumber: number
  }
};


dotest.add('Module', function (test) {
  var balance = messagebird && messagebird.balance;
  var messages = messagebird && messagebird.messages;
  var voice_messages = messagebird && messagebird.voice_messages;
  var hlr = messagebird && messagebird.hlr;
  var verify = messagebird && messagebird.verify;
  var lookup = messagebird && messagebird.lookup;

  test()
    .isFunction('fail', 'exports', app)
    .isObject('fail', 'module', messagebird)
    .isObject('fail', '.balance', balance)
    .isFunction ('fail', '.balance.read', balance && balance.read)
    .isObject('fail', '.messages', messages)
    .isFunction ('fail', '.messages.create', messages && messages.create)
    .isFunction ('fail', '.messages.read', messages && messages.read)
    .isObject('fail', '.voice_messages', voice_messages)
    .isFunction ('fail', '.voice_messages.create', voice_messages && voice_messages.create)
    .isFunction ('fail', '.voice_messages.read', voice_messages && voice_messages.read)
    .isObject('fail', '.hlr', hlr)
    .isFunction ('fail', '.hlr.create', hlr && hlr.create)
    .isFunction ('fail', '.hlr.read', hlr && hlr.read)
    .isObject('fail', '.verify', verify)
    .isFunction ('fail', '.verify.create', verify && verify.create)
    .isFunction ('fail', '.verify.read', verify && verify.read)
    .isFunction ('fail', '.verify.delete', verify && verify.delete)
    .isObject('fail', '.lookup', lookup)
    .isFunction ('fail', '.lookup.read', lookup && lookup.read)
    .isObject ('fail', '.lookup.hlr', lookup && lookup.hlr)
    .isFunction ('fail', '.lookup.hlr.create', lookup && lookup.hlr && lookup.hlr.create)
    .isFunction ('fail', '.lookup.hlr.read', lookup && lookup.hlr && lookup.hlr.read)
    .done();
});


dotest.add('API config', function (test) {
  if (!accessKey || !number) {
    dotest.log('fail', 'MB_ACCESSKEY and/or MB_NUMBER not set');
    dotest.exit();
  } else {
    test()
      .good('API env vars set')
      .info ('Using a ' + accessType + ' access key')
      .done();
  }
});


dotest.add('error handling', function (test) {
  messagebird.messages.create(
    {},
    function (err) {
      test()
        .isError('fail', 'err', err)
        .isExactly('fail', 'err.message', err && err.message, 'api error')
        .isArray('fail', 'err.errors', err && err.errors)
        .done();
    }
  );
});


dotest.add('balance.read', function (test) {
  messagebird.balance.read(function (err, data) {
    test(err)
      .isObject('fail', 'data', data)
      .isNumber('fail', 'data.amount', data && data.amount)
      .isString('fail', 'data.type', data && data.type)
      .isString('fail', 'data.payment', data && data.payment)
      .done();
  });
});


dotest.add('messages.create', function (test) {
  messagebird.messages.create(cache.textMessage, function (err, data) {
    cache.textMessage.id = data && data.id || null;
    test(err)
      .isObject('fail', 'data', data)
      .isString('fail', 'data.id', data && data.id)
      .done();
  });
});


dotest.add('messages.read', function (test) {
  if (cache.textMessage.id) {
    messagebird.messages.read(cache.textMessage.id, function (err, data) {
      if (accessType === 'TEST') {
        test()
          .isError('fail', 'err', err)
          .isExactly('fail', 'err.message', err && err.message, 'api error')
          .isArray('fail', 'err.errors', err && err.errors)
          .done();
      } else {
        test(err)
          .isObject('fail', 'data', data)
          .isExactly('fail', 'data.body', data && data.body, cache.textMessage.body)
          .done();
      }
    });
  }
});


dotest.add('voice_messages.create', function (test) {
  messagebird.voice_messages.create(cache.voiceMessage, function (err, data) {
    cache.voiceMessage.id = data && data.id || null;
    test(err)
      .isObject('fail', 'data', data)
      .isString('fail', 'data.id', data && data.id)
      .done();
  });
});


dotest.add('voice_messages.read', function (test) {
  if (cache.voiceMessage.id) {
    messagebird.voice_messages.read(cache.voiceMessage.id, function (err, data) {
      if (accessType === 'TEST') {
        test()
          .isError('fail', 'err', err)
          .isExactly('fail', 'err.message', err && err.message, 'api error')
          .isArray('fail', 'err.errors', err && err.errors)
          .done();
      } else {
        test(err)
          .isObject('fail', 'data', data)
          .isExactly('fail', 'data.body', data && data.body, cache.voiceMessage.body)
          .done();
      }
    });
  }
});


dotest.add('hlr.create', function (test) {
  messagebird.hlr.create(
    number,
    'The ref',
    function (err, data) {
      cache.hlr.id = data && data.id || null;
      test(err)
        .isObject('fail', 'data', data)
        .isString('fail', 'data.id', data && data.id)
        .done();
    }
  );
});


dotest.add('hlr.read', function (test) {
  if (cache.hlr.id) {
    messagebird.hlr.read(cache.hlr.id, function (err, data) {
      if (accessType === 'TEST') {
        test()
          .isError('fail', 'err', err)
          .isExactly('fail', 'err.message', err && err.message, 'api error')
          .isArray('fail', 'err.errors', err && err.errors)
          .done();
      } else {
        test(err)
          .isObject('fail', 'data', data)
          .isExactly('fail', 'data.msisdn', data && data.msisdn, number)
          .done();
      }
    });
  }
});


dotest.add('verify.create', function (test) {
  messagebird.verify.create(cache.verify.recipient, function (err, data) {
    cache.verify.id = data && data.id || null;
    test(err)
      .isObject('fail', 'data', data)
      .isString('fail', 'data.id', data && data.id)
      .done();
  });
});


dotest.add('verify.read', function (test) {
  if (cache.verify.id) {
    messagebird.verify.read(cache.verify.id, function (err, data) {
      test(err)
        .isObject('fail', 'data', data)
        .isExactly('fail', 'data.id', data && data.id)
        .done();
    });
  }
});


dotest.add('verify.delete', function (test) {
  if (cache.verify.id) {
    messagebird.verify.delete(cache.verify.id, function (err, data) {
      test(err)
        .isExactly('fail', 'data', data, true)
        .done();
    });
  }
});

dotest.add('lookup.read', function (test) {
  messagebird.lookup.read(cache.lookup.phoneNumber, function (err, data) {
    test(err)
      .isObject('fail', 'data', data)
      .isExactly('fail', 'data.countryCode', data && data.countryCode, 'NL')
      .isExactly('fail', 'data.type', data && data.type, 'mobile')
      .isObject('fail', 'data.formats', data && data.formats)
      .done();
  });
});

dotest.add('lookup.lookup.hlr.create', function (test) {
  messagebird.lookup.hlr.create(cache.lookup.phoneNumber, function (err, data) {
    cache.lookup.id = data && data.id || null;
    test(err)
      .isObject('fail', 'data', data)
      .isExactly('fail', 'data.status', data && data.status, 'sent')
      .isNull('fail', 'data.network', data && data.network)
      .isNull('fail', 'data.details', data && data.details)
      .done();
  });
});

dotest.add('hlr.lookup.hlr.read', function (test) {
  setTimeout(function () {
    messagebird.lookup.hlr.read(cache.lookup.phoneNumber, function (err, data) {
      if (accessType === 'TEST' && err) {
        test()
          .isError('fail', 'err', err)
          .isExactly('fail', 'err.message', err && err.message, 'api error')
          .isArray('fail', 'err.errors', err && err.errors)
          .done();
      } else {
        test(err)
          .isObject('fail', 'data', data)
          .isExactly('fail', 'data.id', data && data.id, cache.lookup.id)
          .isExactly('fail', 'data.status', data && data.status, 'absent')
          .isExactly('fail', 'data.network', data && data.network, 20408)
          .isObject('fail', 'data.details', data && data.details)
          .isExactly('fail', 'data.details.country_iso', data && data.details && data.details.country_iso, 'NLD')
          .done();
      }
    });
  }, 500);
});

// Start the tests
dotest.run();
