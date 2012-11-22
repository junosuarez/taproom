var opt = require('optimist');
var request = require('request');
var _ = require('lodash');

var rooms = [
  {
    id: 'baileys',
    name: 'Bailey\'s Taproom',
    location: 'Portland, OR',
    api: 'http://api.legitimatesounding.com/api/baileys',
    adapter: function (resp) {
      return _(resp.data).map(function (beer, tap) {
        return {tap: tap, brewery: beer.brewery, name: beer.beer, fill: beer.fill};
      });
    }
  }
];

var argv = opt.usage('taproom | grep -i ipa')
            .options('r', {
              alias: 'room',
              default: 'baileys'
            })
            .options('l', {
              alias: 'list',
              boolean: true
            }).argv;
var defaultRoom = 'baileys';

var room = _.find(rooms, function (room) { return room.id === argv.room || defaultRoom });

if (argv.l) {
  console.log ('Known taptooms:')
  _.forEach(rooms, function(room) {
    console.log([room.id, room.name, room.location].join('\t'));
  });
  process.exit();
}


request(room.api, function (err, req, res) {
  var res = JSON.parse(res);
  var data = room.adapter(res);
  data.forEach(function (beer) {
    console.log([beer.tap, beer.brewery, beer.name, beer.style, formatPercent(beer.fill)].join('\t'));
  });
});

function formatPercent(float) {
  return parseInt(float*100) + '%';
}