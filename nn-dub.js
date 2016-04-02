// ==UserScript==
// @name         Dubtrack Voters
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       niconneo_ @dubtrack
// @match        https://www.dubtrack.fm/join/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    $('#header-global').append($('<span style="font-size: 14px;position: absolute;/* display: none; */"><font color=green id=nn-voters-1></font><br><font color=red id=nn-voters-2></font></span>'));

    var pidori = {};
    var id = '';

    function update() {
        var a = [0, '', ''];
        $.each(pidori, function(k, v) {
            a[v] += ', ' + k;
        });
        $('#nn-voters-1').text(a[1].substr(2));
        $('#nn-voters-2').text(a[2].substr(2));
    }

    Dubtrack.Events.bind('realtime:room_playlist-dub', function(data) {
        console.log('[nn] new vote ', data);
        console.log('[nn]', data.dubtype, data.user.username);
        if (data.dubtype == 'updub') {
            pidori[data.user.username] = 1;
        } else if (data.dubtype == 'downdub') {
            pidori[data.user.username] = 2;
        } else {
            console.log('[nn] WTF is this???', data.dubtype);
        }
        update();
    });

    Dubtrack.Events.bind("realtime:room_playlist-update", function(data) {
        console.log('[nn] clear', data);
        console.log('[nn]', id, data.song.songid);
        if (id != data.song.songid) {
            pidori = {};
            id = data.song.songid;
            console.log('[nn] next song, wiping data');
        }
        update();
    });
})();
