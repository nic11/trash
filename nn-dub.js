// ==UserScript==
// @name        Dubtrack Voters [TEST]
// @namespace   niconneo
// @include     https://www.dubtrack.fm/join/*
// @version     1
// @grant       none
// ==/UserScript==

(function() {
    var nn_lib = {
        randomInteger: function(min, max) {
            var rand = min - 0.5 + Math.random() * (max - min + 1);
            rand = Math.round(rand);
            return rand;
        },

        choose: function(items) {
            return items[nn_lib.randomInteger(0, items.length - 1)];
        },

        send: function(message) {
            console.info('!!!!!!', message);
            //return;
            var old = Dubtrack.room.chat._messageInputEl.val();
            Dubtrack.room.chat._messageInputEl.val(message);
            Dubtrack.room.chat.sendMessage();
            Dubtrack.room.chat._messageInputEl.val(old);
        }
    };

    var nn_votersLine = {
        currentSong: '',
        currentSongId: '',
        votes: {},
        grabs: [],
        streak: {},

        getLines: function() {
            var a = [[], [], []];
            for (var k in nn_votersLine.votes) {
                a[nn_votersLine.votes[k]].push(k);
            }
            return a;
        },

        update: function() {
            var i;
            var s;
            var l = nn_votersLine.getLines();

            s = '';
            for (i = 0; i < l[1].length; ++i) {
                s += ', ' + l[1][i] + '\u00a0(' + nn_votersLine.streak[l[1][i]] + ')';
            }
            $('#nn-voters-1').text(s.slice(2));

            s = '';
            for (i = 0; i < l[2].length; ++i) {
                s += ', ' + l[2][i] + '\u00a0(' + nn_votersLine.streak[l[2][i]] + ')';
            }
            $('#nn-voters-2').text(s.slice(2));
            
            $('#nn-voters-3').text(nn_votersLine.grabs.join(', '));
        },

        dub: function(user, type) {
            if (nn_votersLine.streak[user] == undefined) {
                nn_votersLine.streak[user] = 0;
            }
            nn_votersLine.votes[user] = type;
            nn_votersLine.update();
        },

        ev1: function(data) {
            try {
                //console.log('[nn] new vote ', data);
                console.log('[nn]', data.dubtype, data.user.username);
                if (data.dubtype == 'updub') {
                    nn_votersLine.dub(data.user.username, 1);
                } else if (data.dubtype == 'downdub') {
                    nn_votersLine.dub(data.user.username, 2);
                } else {
                    console.log('[nn] WTF is this???', data.dubtype);
                }
            } catch (e) {
                console.error('votes ev1', e);
                console.error(e.stack);
            }
        },

        ev2: function(data) {
            try {
                console.log('[nn] grab', data.user.username);
                if (nn_votersLine.grabs.indexOf(data.user.username) == -1) {
                    nn_votersLine.grabs.push(data.user.username);
                    nn_votersLine.update();
                }
            } catch (e) {
                console.error('votes ev2', e);
                console.error(e.stack);
            }
        },

        ev3: function(data) {
            try {
                console.log('[nn] playlist update');
                var nextName = '', nextId = '';
                if (data.raw) {
                    nextId = data.raw.songInfo._id;
                    nextName = data.raw.songInfo.name;
                } else {
                    nextId = data.songInfo._id;
                    nextName = data.songInfo.name;
                }
                if ((nn_votersLine.currentId == '' && data.startTime < 6) || nn_votersLine.currentSongId != nextId) {
                    for (var key in nn_votersLine.streak) {
                        if (nn_votersLine.votes[key] === undefined) {
                            nn_votersLine.streak[key] = 0;
                        } else {
                            ++nn_votersLine.streak[key];
                        }
                    }
                    nn_votersLine.votes = {};
                    nn_votersLine.grabs = [];
                }
                nn_votersLine.currentSong = nextName;
                nn_votersLine.currentSongId = nextId;
                console.log('SONG:', nn_votersLine.currentSong);
                nn_votersLine.update();
            } catch (e) {
                console.error('votes ev3', e);
                console.error(e.stack);
            }
        },

        init: function() {
            $('.header-center-logo').css('z-index', 0);
            $('#header-global').append($(
                '<span style="font-size: 14px; position: absolute; right: 320px; left: 270px; top:5px; pointer-events: none;">' +
                    '<font style="color:green; background:rgba(0, 0, 0, .5); pointer-events: all;" id=nn-voters-1></font><br>' +
                    '<font style="color:red; background:rgba(0, 0, 0, .5); pointer-events: all;" id=nn-voters-2></font><br>'+
                    '<font style="color:yellow; background:rgba(0, 0, 0, .5); pointer-events: all;" id=nn-voters-3></font>'+
                '</span>')
            );
            Dubtrack.Events.on('realtime:room_playlist-dub', nn_votersLine.ev1);
            Dubtrack.Events.on('realtime:room_playlist-queue-update-grabs', nn_votersLine.ev2);
            Dubtrack.Events.on("realtime:room_playlist-update", nn_votersLine.ev3);
        }
    };

    nn_votersLine.init();

    window.nn_lib = nn_lib;
    window.nn_votersLine = nn_votersLine;
})();
