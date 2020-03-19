
global = {}

no_support = 'no_support'

  var root = '';
  var exampleDomain = '192.168.1.166:8080'
  if (window.location.hostname == 'example.com')
    root = 'http://' + exampleDomain
  var config = {}
  var videoMode = 'off';
  var audioMode = 'off';

  var working = null;
  var showing = null;
  var jsUpdate = false;
  var jsSizeOk = false;
  var videoSize = [1,1];
  var aspect = 0.0;

  var wsAudioCtx = null;
  var micStream = null;
  var twaWebsocket = null;
  var twaPressed = false;
  var twaMicStream = null;
  
  var get_val = function(id) {
    return function() {return $(id).val()};
  }

  var display_error = function(cause, details) {
    return function(cause, details) {
      return function(xhr, textStatus) {
        $('#warn_desc').text(details+", "+textStatus);
        $('#warn_cause').text(cause);
        $('#warn_div').show();
      }
    } (cause, details)
  }



  var zoom_holder = {
    val: get_val('#range_zoom'), 
    id: -9999, 
    upd: function(val) {
      $('#range_zoom_label').text((config.avail.zoom[val] / 100) + ' X');
    },
    cmd: function(val) {$.ajax(root+'/ptz?zoom='+val).fail(display_error('cannot_set', 'zoom'));}
  };

  var quality_holder = {
    val: get_val('#range_quality'), 
    id: -9999, 
    upd: function(val) {
      $('#range_quality_label').text(val + '%');
    }, 
    cmd: function(val) {
      if (val == 0) {
        val = 1;
      }
      $.ajax(root+'/settings/quality?set='+val).fail(display_error('cannot_set', 'quality'));
    }
  };

  var molimit_holder = {
    val: get_val('#range_motion_limit'), 
    id: -9999, 
    upd: function(val) {
    }, 
    cmd: function(val) {
      if (val == 0) {
        val = 100;
      }
      $.ajax(root+'/settings/motion_limit?set='+val).fail(display_error('cannot_set', 'motion_limit'));
    }
  };


  var exposure_holder = {
    val: get_val('#range_exposure'), 
    id: -9999, 
    upd: function(val) {
      $('#range_exposure_label').text((config.avail.exposure[val]));
    },
    cmd: function(val) {$.ajax(root+'/settings/exposure?set='+config.avail.exposure[val])
    .fail(display_error('cannot_set', 'exposure'));}
  };

  var nvavg_holder = {
    val: get_val('#range_nightvision_average'), 
    id: -9999, 
    upd: function(val) {
      $('#range_nightvision_average_label').text( val );
    },
    cmd: function(val) {
      $.ajax(root+'/settings/night_vision_average?set='+val).fail(display_error('cannot_set', 'night_vision_average'));
    }
  };

  var nvgain_holder = {
    val: function() { return (get_val('#range_nightvision_gain')() / 4.0).toFixed(2)}, 
    id: -9999, 
    upd: function(val) {
      $('#range_nightvision_gain_label').text( val + ' X');
    },
    cmd: function(val) {
      $.ajax(root+'/settings/night_vision_gain?set='+val).fail(display_error('cannot_set', 'night_vision_gain'));
    }
  };


  var scheduleUpdate = function(holder) {
    var val = holder.val();
    holder.upd(val);
    clearTimeout(holder.id);
    holder.id = setTimeout(function () {
      if (holder.val() == val) {
        holder.cmd(val);
      }
    } ,100)
  }

  var scheduleUpdateW = function(holder) {
    return function() {scheduleUpdate(holder)};
  }

  var scheduleTimeout = function(holder) {
    clearTimeout(holder.id);
    holder.id = setTimeout(function(){ holder.tick(holder) }, holder.time);
  }

  var setActive = function(name, active) {
    var cb = $('#'+name+'cb')
    cb.attr("checked", active)
    var btn = $('#'+name+'btn');
    if (active)
      btn.addClass('active');
    else
      btn.removeClass('active');
  }


  var setupSwitch = function(name, array, active, url, raw) {
    var ename = '#'+name;
    var el = $(ename).empty()
    var do_translation = function(val) {
      return translate(name+'_'+val);
    }
    if (raw) {
      do_translation = function(val) {
        return val;
      }
    }
    for (var i = 0; i<array.length; ++i) {
      var translated_name = do_translation(array[i]);
      el.append($('<li style="cursor: pointer;"><a>'+translated_name+'</a></li>')
        .click(
          (function(local_url, valTrans) {
            return function() {
              $.ajax(local_url).fail(display_error('cannot_fetch', local_url))
              $(ename+'_btn').html(valTrans + ' <b class="caret"></b>')
            }
          })
          (url + array[i], translated_name)
      ));
    }
    $(ename+'_btn').html(do_translation(active) + ' <b class="caret"></b>').removeClass('disabled')
  }

  var circ_setter = function(x) {
    return function() {
      $('#circular_length').text(minutes_to_readable(x));
      $.ajax(root+'/settings/video_chunk_len?set='+x);
    }
  }

  var reconfigure = function () {
    config.curvals = config.curvals || {}
    config.curvals.video_size = config.curvals.video_size || "1x1"
    videoSize = config.curvals.video_size.split('x');
    videoSize[0] -= 0;
    videoSize[1] -= 0;
    aspect = (videoSize[0] + 0.0) / videoSize[1];

    $('#circular_length').text(minutes_to_readable(config.curvals.video_chunk_len));

    $('#circular_2h').click(circ_setter(120));
    $('#circular_1h').click(circ_setter(60));
    $('#circular_30m').click(circ_setter(30));
    $('#circular_10m').click(circ_setter(10));
    $('#circular_5m').click(circ_setter(5));

    if (config.avail.zoom == undefined) {
      $('#range_zoom').hide();
    } else {
      if (config.curvals.zoom == -1)
        config.curvals.zoom = 0;
      $('#range_zoom')
        .attr('min',0)
        .attr('max',config.avail.zoom.length-1)
        .attr('value', config.avail.zoom.indexOf(config.curvals.zoom))
        .change(scheduleUpdateW(zoom_holder));
      zoom_holder.upd(zoom_holder.val());
    }
    if (config.avail.torch != undefined) {
      var flashcb = $('#flashcb')
        .change(function() {
          if (flashcb.is(":checked")) {
            $.ajax(root+'/enabletorch').fail(display_error('cannot_set', 'torch'))
          } else {
            $.ajax(root+'/disabletorch').fail(display_error('cannot_set', 'torch'))
          }
      })
      setActive('flash', config.curvals.torch == "on");
    } else {
      $('#flashbtn').hide();
    }
    var focuscb = $('#focuscb')
      .change(function() {
        if (focuscb.is(":checked")) {
          $.ajax(root+'/focus').fail(display_error('cannot_set', 'focus'))
        } else {
          $.ajax(root+'/nofocus').fail(display_error('cannot_set', 'focus'))
        }
      })
    setActive('focus', config.curvals.focus == "on");
    
    var overlaycb = $('#overlaycb')
      .change(function() {
        if (overlaycb.is(":checked")) {
          $.ajax(root+'/settings/overlay?set=on').fail(display_error('cannot_set', 'overlay'))
        } else {
          $.ajax(root+'/settings/overlay?set=off').fail(display_error('cannot_set', 'overlay'))
        }
      })
    setActive('overlay', config.curvals.overlay == "on");

    var nvcb = $('#nvcb')
      .change(function() {
        if (nvcb.is(":checked")) {
          $.ajax(root+'/settings/night_vision?set=on').fail(display_error('cannot_set', 'night_vision'))
        } else {
          $.ajax(root+'/settings/night_vision?set=off').fail(display_error('cannot_set', 'night_vision'))
        }
      })
    setActive('nv', config.curvals.night_vision == "on");


    $('#range_quality')
      .val(config.curvals.quality)
      .change(scheduleUpdateW(quality_holder));

    if (config.curvals.exposure != undefined) {
      $('#range_exposure')
        .attr('min',0)
        .attr('max',config.avail.exposure.length-1)
        .val(config.avail.exposure.indexOf(config.curvals.exposure))
        .change(scheduleUpdateW(exposure_holder))
      exposure_holder.upd(exposure_holder.val())
    } else {
      $('#exposure_host').css('display', 'none');
    }

    $('#range_motion_limit')
      .val(config.curvals.motion_limit)
      .change(scheduleUpdateW(molimit_holder))
    
    $('#range_nightvision_gain')
      .val(Math.round(config.curvals.night_vision_gain * 4))
      .change(scheduleUpdateW(nvgain_holder))
    nvgain_holder.upd(nvgain_holder.val())
    $('#set_nvg_1').click(function() {
      $('#range_nightvision_gain').val(4)
      scheduleUpdate(nvgain_holder);
    })


    $('#range_nightvision_average')
      .val(config.curvals.night_vision_average)
      .change(scheduleUpdateW(nvavg_holder))
    nvavg_holder.upd(nvavg_holder.val())
    $('#set_avg_2').click(function() {
      $('#range_nightvision_average').val(2)
      scheduleUpdate(nvavg_holder);
    })

    
    var selectCfg = ['photo_size', 'video_size', 'orientation', 'mirror_flip', 'flashmode','focusmode','scenemode','whitebalance','coloreffect','antibanding', 'exposure_lock', 'whitebalance_lock']

    for (var i = 0; i<selectCfg.length; ++i) {
      var v = selectCfg[i];
      if (config.avail[v] != undefined) {
        setupSwitch(v, config.avail[v], config.curvals[v], root+'/settings/'+v+'?set=', ['photo_size', 'video_size'].indexOf(v) != -1);
      } else {
        $('#'+v+'_holder').css('display', 'none');
      }
    }
    
    $("#modet_toggle").click(function() {
      if ($(this).hasClass('active')) {
        $.ajax(root+'/settings/motion_detect?set=off')
        $(this).removeClass('active')
      } else {
        $.ajax(root+'/settings/motion_detect?set=on')
        $(this).addClass('active')
      }
    })
    if (config.curvals.motion_detect == 'on') {
      $("#modet_toggle").addClass('active')
    }

    $("#motion_display").click(function() {
      if ($(this).hasClass('active')) {
        $.ajax(root+'/settings/motion_display?set=off')
        $(this).removeClass('active')
      } else {
        $.ajax(root+'/settings/motion_display?set=on')
        $(this).addClass('active')
      }
    })
    if (config.curvals.motion_display == 'on') {
      $("#motion_display").addClass('active')
    }


    if (config.avail.ffc != undefined) {
      if (config.avail.ffc[0] == no_support) {
        $('#ffc_form').css('display', 'none')
      } else {
        if (config.avail.ffc.length == 1) {
          $('#ffc_res_unsupported').css('display', '')
        } else {
          global.ffc_enabled = (config.curvals.ffc == 'on')
          updateFfcPics(global.ffc_enabled);
          $('#ffcbtn').css('display', '')
          $('#ffcbtn')
            .click(function() {
              global.ffc_enabled = !global.ffc_enabled;
              updateFfcPics(global.ffc_enabled)
              $.ajax(root+'/settings/ffc?set=' + (global.ffc_enabled ? "on" : "off"))
               .fail(display_error('cannot_set', 'ffc'));
            })
        }
      }
    }

    quality_holder.upd(quality_holder.val());

    updateVideoInfo(config.video_status);
    scheduleTimeout(videoTimeout);

    //$('#focusbtn').hide()
  }

  function writeUTFBytes(view, offset, string){ 
    var lng = string.length;
    for (var i = 0; i < lng; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  var wavHeader = function(sampleRate) {

      var buffer = new ArrayBuffer(44);
      var view = new DataView(buffer);
      writeUTFBytes(view, 0, 'RIFF');
      view.setUint32(4, 0xffffffff, true);
      writeUTFBytes(view, 8, 'WAVE');
      writeUTFBytes(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeUTFBytes(view, 36, 'data');
      view.setUint32(40, 0xffffffff, true);
      return buffer
  }

  var twaConnectWebsocket = function() {
      if (twaWebsocket) {
          if (twaWebsocket.readyState == 1) {
              return
          }
          twaWebsocket.onclose = undefined
          twaWebsocket.close()
          twaWebsocket = null
      }
      var websocketHost = window.location.host + window.location.pathname.replace("greet.html",'').substr(1)
      if (window.location.hostname == "example.com") {
        websocketHost = exampleDomain
      }
      var wsProto = 'ws://'
      if (window.location.protocol.toLowerCase() == 'https:') {
        wsProto = 'wss://'
      }
      twaWebsocket = new WebSocket(wsProto+websocketHost+'/audioin.wav')
      twaWebsocket.wroteWavHeader = false
      twaWebsocket.onopen = function() {
          twaInit()
      }
      twaWebsocket.onclose = function() {
          twaWebsocket = null
          setTimeout(function() {
            $('#twaSwitch').attr('checked', false)
          }, 500)
          $('#warn_desc').text("Websocket disconnected");
          $('#warn_cause').text("Two-way audio error");
          $('#warn_div').show();
      }
  }
  var twaSoundAllowed = function (stream) {
      twaMicStream = stream;
      window.persistAudioStream = stream;
      wsAudioCtx = new AudioContext();

      micStream = wsAudioCtx.createMediaStreamSource(stream);
      var scriptNode = wsAudioCtx.createScriptProcessor(4096, 1, 1);
      scriptNode.onaudioprocess = function(audioProcessingEvent) {
          if (!twaPressed) {
              return;
          }
          if (!twaWebsocket) {
              return;
          }
          var inputBuffer = audioProcessingEvent.inputBuffer;
          var inData = inputBuffer.getChannelData(0);
          if (!twaWebsocket.wroteWavHeader) {
              twaWebsocket.wroteWavHeader = true;
              twaWebsocket.send(wavHeader(wsAudioCtx.sampleRate))
          }
          if (twaWebsocket && twaWebsocket.readyState == 1) {
              var buffer = new ArrayBuffer(inData.length * 2);
              var view = new DataView(buffer);

              for (var i = 0; i<inData.length; i++) {
                  view.setInt16(i * 2, 0x7ffe * inData[i], true)
              }
              twaWebsocket.send(buffer)
          }
      }
      micStream.connect(scriptNode)
      scriptNode.connect(wsAudioCtx.destination);
      $('#twaBlink').show();
      if (!twaPressed) {
          twaStop();
      }
  }
  var twaInit = function(successFunc) {
      "use strict";
      /*if (twaMicStream) {
          return twaSoundAllowed(twaMicStream)
      }*/

      var soundNotAllowed = function (error) {
          $('#blocked_mic_explain').show();
          $('#try_https').show();
          $('#try_https').click(function() {
            var my_url = window.location.href.toLowerCase().replace("http:","https:")
            $('#https_target').attr('href', my_url).text(my_url)
            $('#explain_https').modal();
          });
          $('#twaBlink').hide();
          $('#twaSwitch').attr('checked', false)
      }

      var navigator = navigator || window.navigator;
      navigator.getUserMedia =  navigator.getUserMedia       ||
                                navigator.webkitGetUserMedia ||
                                navigator.mozGetUserMedia    ||
                                navigator.mediaDevices.getUserMedia ||
                                null;
      navigator.getUserMedia({audio:true}, twaSoundAllowed, soundNotAllowed);
  }
  var twaStart = function () {
      if (!twaWebsocket) {
          return twaConnectWebsocket()
      }
      if (twaWebsocket.readyState == 1) {
          twaInit()
      }
  };

  var twaStop = function() {
      $('#twaBlink').hide();
      $('#twaSwitch').attr('checked', false)
      if (twaWebsocket) {
        twaWebsocket.onclose = undefined
        twaWebsocket.close()
        twaWebsocket = null
      }
      if (wsAudioCtx) {
          wsAudioCtx.suspend()
          twaMicStream.getTracks()[0].stop()
      }
  }



  var updateFfcPics = function(ffc_enabled) {
    var pic1 = 'ic_switch_camera_back_normal.png';
    var pic2 = 'ic_switch_camera_front_normal.png';
    if (ffc_enabled) {
      var pic3 = pic2;
      pic2 = pic1;
      pic1 = pic3;
    }
    $('#img_ffc_current').attr('src', pic1)
    $('#img_ffc_alt').attr('src', pic2)
  }
  
  var onAudioModeChange = function() {
    var mode = $(this).val()
    if (mode != audioMode) {
      audioDestroy();
      audioMode = mode;
      audioCreate();
    }
  }

  var audioCreate = function() {
    if (audioMode == 'off') {

    } else if (audioMode == 'flash') {
      var url = '/video';
      var swfVersionStr = "11.1.0";
      var xiSwfUrlStr = "playerProductInstall.swf";
      var mode = "Aat"
      $('#audio_pane').append($('<div id="flash_audio" class="flash-audio"></div>'))
      var wwidth = $('#flash_audio').width();
      var wheight = $('#flash_audio').height();
      var flashvars = {'cvideo': url, 'video':(my_url() + '/video4flash'), 'audio':(my_url() + '/audio.wav'), 'twa':(my_url() + '/audioin.alaw'), 'mode':mode, 'wwidth': wwidth, 'wheight': wheight, 'debug':true};
      var params = {};
      params.quality = "high";
      params.bgcolor = "#cccccc";
      params.allowscriptaccess = "always";
      params.allowfullscreen = "true";
      var attributes = {};
      attributes.id = "flash_audio_obj";
      attributes.name = "flash_audio_obj";
      /*if (!altrenderer) {
        attributes.align = "middle";
      } else {
        attributes.style = "position: absolute;";
      }*/
      var embedHandler = function (e) { flash_renderer = e.ref; }
      swfobject.embedSWF(
        "mjp.swf", "flash_audio", 
        wwidth, wheight, 
        swfVersionStr, xiSwfUrlStr, 
        flashvars, params, attributes, embedHandler);
      // JavaScript enabled so display the flash_audio div in case it is not replaced with a swf object.
      swfobject.createCSS("#flash_audio", "display:block;text-align:left;");
    } else if (audioMode == 'html5_wav') {
      $('#audio_pane').append($('<audio id="html5_audio" controls><source src="'+root+'/audio.wav" type="audio/wav"/></audio>'));
      $('#html5_audio')[0].play();
    } else if (audioMode == 'html5_opus') {
      $('#audio_pane').append($('<audio id="html5_audio" controls><source src="'+root+'/audio.opus" type=\'audio/ogg; codecs="opus"\'/></audio>'));
      $('#html5_audio')[0].play();
    }
  }

  var audioDestroy = function() {
    if (audioMode == 'off') {
      // Do nothing
    } else if (audioMode == 'flash') {
      $('#flash_audio').remove();
      $('#flash_audio_obj').remove();
    } else if (audioMode == 'html5_wav') {
      $('#html5_audio').remove();
    } else if (audioMode == 'html5_opus') {
      $('#html5_audio').remove();
    }
  }

  var videoDestroy = function () {
    if (videoMode == 'off') {
      // Do nothing
    } else if (videoMode == "flash") {
      $('#flash_video').remove();
      $('#flash_video_obj').remove();
    } else if (videoMode == "browser") {
      $('#browser_video').attr('src','')
      $('#browser_video').remove();
    } else if (videoMode == "java") {
      $('#java_video').remove();
    } else if (videoMode == "js") {
      $('#img1').remove()
      $('#img2').remove()
      jsUpdate = false;
      working = null;
      showing = null;
    }
  }

  var my_url = function () {
    if (root != "")
      return root;
    var port_part = ":" + window.location.port;
    if (port_part == ":80") {
        port_part = "";
    }
    return window.location.protocol + "//" + window.location.hostname + port_part;
  }

  var jsLoadImage = function() {
    if (!jsUpdate)
      return;

    var oldshowing = showing;
    showing = working;
    working = oldshowing;
    showing.css('visibility', 'visible')
    working.css('visibility', 'hidden')

    showing.unbind()
    working.load(jsLoadImage);
    working.attr("src", root + "/shot.jpg?rnd="+Math.floor(Math.random()*1000000));
    if (!jsSizeOk) {
      jsSizeOk = true;
      $("#img2").css('margin-top', '-'+showing.height()+'px').css('display', 'block');
    }
  }


  var videoTimeout = {
    id: -1,
    time: 4000,
    tick: function() {
      $.ajax(root+'/videostatus')
       .done(function (info) {
         updateVideoInfo(info);
         scheduleTimeout(videoTimeout)
       })
       .fail(function() {
         scheduleTimeout(videoTimeout)
       })
    }
  }

  var updateVideoInfo = function(info) {

    if (info.mode == "none") {
      $('#video_rec').css('display','none');
    } else if (info.mode == "not_supported") {
      $('#video_host1').css('display','none');
      $('#video_host2').css('display','none');
    } else {
      $('#rec_location').text(info.fname);
      $('#video_rec').show();
    }
  }

  var videoCreate = function () {
    if (videoMode == 'off') {
      $("#video_pane").css('display', 'none');
      return;
    }
    $("#video_pane").css('display', 'table');
    if (videoMode == "flash") {
      var url = '/video';
      var swfVersionStr = "11.1.0";
      var xiSwfUrlStr = "playerProductInstall.swf";
      var mode = "Vat"
      $('#video_pane').append($('<div id="flash_video" class="video-display"></div>'))
      var wwidth = $('#flash_video').width();
      var wheight = $('#flash_video').height();
      var flashvars = {'cvideo': url, 'video':(my_url() + '/video4flash'), 'audio':(my_url() + '/audio.wav'), 'twa':(my_url() + '/audioin.alaw'), 'mode':mode, 'wwidth': wwidth, 'wheight': wheight, 'debug':true};
      var params = {};
      params.quality = "high";
      params.bgcolor = "#cccccc";
      params.allowscriptaccess = "always";
      params.allowfullscreen = "true";
      var attributes = {};
      attributes.id = "flash_video_obj";
      attributes.name = "flash_video_obj";
      attributes['class'] = "video-display"
      /*if (!altrenderer) {
        attributes.align = "middle";
      } else {
        attributes.style = "position: absolute;";
      }*/
      var embedHandler = function (e) { flash_renderer = e.ref; }
      swfobject.embedSWF(
        "mjp.swf", "flash_video", 
        wwidth, wheight, 
        swfVersionStr, xiSwfUrlStr, 
        flashvars, params, attributes, embedHandler);
      // JavaScript enabled so display the flash_video div in case it is not replaced with a swf object.
      swfobject.createCSS("#flash_video", "display:block;text-align:left;");
    } else if (videoMode == "browser") {
      $('#video_pane').append($('<img id="browser_video" class="video-image" alt="video" src="'+root+'/video"/>'))
    } else if (videoMode == "java") {
      // Java
      $('#video_pane').append($('<applet id="java_video" code="com.charliemouse.cambozola.Viewer" archive="cambozola.jar" class="video-display"><param name="url" value="video"/></applet>'));
    } else if (videoMode == "js") {
      $('#video_pane').append($('<img id="img1" class="video-image" alt="video" src="'+root+'/shot.jpg?1"/>'))
      $('#video_pane').append($('<img id="img2" class="video-image" style="display: none;" alt="video" src="'+root+'/shot.jpg?2"/>'))
      working = $("#img2");
      showing = $("#img1");
      working.css("zIndex", -1);
      jsSizeOk = false;
      jsUpdate = true;
      working.load(jsLoadImage);
      working.attr("src", root + "/shot.jpg?rnd="+Math.floor(Math.random()*1000000));
    }
  }

  var onVideoModeChange = function () {
    var mode = $(this).val()
    if (mode != videoMode) {
      videoDestroy();
      videoMode = mode;
      videoCreate();
    }
  }

  var fullscreen = function(el) {
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  };


var greetInit = function() {
  $('.has-tooltip').tooltip({'container': 'body'});
  $.ajax(root+'/status.json?show_avail=1')
   .done(function (data) {
     config = data;
     reconfigure();
   })
   .fail(function (xhr, textStatus, errorThrown) {
     $('#init_error').text('"'+textStatus+'"');
     $('#init_alert').show()
   })
   $(window).resize(function() {
     jsSizeOk = false;
   })

  var twaSwitch = $('#twaSwitch')
    .change(function() {
      twaPressed = twaSwitch.is(":checked");
      if (twaPressed) {
        twaStart()
      } else {
        twaStop()
      }
    })

  $.ajax(root+'/modet_areas.json')
    .done(function(data) {
      for (var i = 0; i<8; i++) {
        for (var j = 0; j<8; j++) {
          if (data[i][j] == 1) {
            $('#ma'+j+i).addClass('active')
          } else {
            $('#ma'+j+i).removeClass('active')
          }
          $('#ma'+j+i).click(function() {
            pair = $(this).attr('data-num').split(',')
            var prefix = root+'/settings/modet_areas?x='+pair[0]+'&y='+pair[1]
            if ($(this).hasClass('active')) {
              $(this).removeClass('active')
              var which = this;
              $.ajax(prefix + '&enabled=0')
               .fail(function() {
                $(which).addClass('active')
               })
            } else {
              $(this).addClass('active')
              var which = this;
              $.ajax(prefix + '&enabled=1')
               .fail(function() {
                $(which).removeClass('active')
               })
            }
          })
        }
      }
    })
    .fail(function (xhr, textStatus, errorThrown) {
      $('#init_error').text('"'+textStatus+'"');
      $('#init_alert').show()
    })

  $('#btn_why_lag').click(function() {
    $('#explain_audio').modal();
   })
   $('#btn_explain_tasker').click(function() {
    $('#explain_tasker').modal();
   })

   $('.tbtn').click(function() {
    $.ajax(root+'/gen?event='+$(this).attr('data-num'))
   })

  $('#rec_stop').click(function() {
    $.ajax(root+'/stopvideo?force=1')
    .done(function(){$('#video_rec').hide(); $('#rec_stop').removeClass('disabled');})
    .fail(function(xhr, txt){ display_error("start_video_error", "")(xhr, txt); $('#rec_stop').removeClass('disabled'); })

    $('#rec_stop').addClass('disabled');
   })

  $('#rec_button').click(function() {
    if ($('#video_tag').val() == '') {
      $('#video_tag').val('rec');
    }
    $.ajax(root+'/startvideo?force=1&tag='+encodeURIComponent($('#video_tag').val()))
    .done(function(data){ $('#rec_button').removeClass('disabled'); updateVideoInfo(data); })
    .fail(function(xhr, txt){ display_error("start_video_error", "")(xhr, txt); $('#rec_button').removeClass('disabled'); })

    $('#rec_button').addClass('disabled');
  });

  $('#btn_fullscreen').click(function() {
    var mode = $(this).val()
    if (videoMode == 'off') {
      window.alert(translate('select_video_mode_first'))
    } else {
      if (videoMode == 'flash') {
        window.open('flash.html');
      } else if (videoMode == 'js') {
        window.open('jsfs.html');
      } else if (videoMode == 'browser') {
        window.open('browserfs.html');
      } else if (videoMode == 'java') {
        window.open('javafs.html');
      }
      $('#video_mode').children().removeClass('active');
      $('#video_radio_none').addClass('active');
      videoDestroy();
      videoMode = 'off';
      videoCreate();
    }
  })

  var photo_url = function(url) {
    return function() {
      $.ajax(root + url)
      .always(function() {
         $('#photo_spinner').css('display', 'none')
      })
      .done(function() {
         $('#photo_ok').fadeIn('slow', function() {
          $('#photo_ok').fadeOut('slow')
         })
      })
      $('#photo_spinner').fadeIn('fast')
    }
  }

  $('#btn_photo_storage').click(photo_url('/photo_save_only.jpg'));
  $('#btn_photoaf_storage').click(photo_url('/photoaf_save_only.jpg'));
   
  $('#rec_circular').click(function() {
    $.ajax(root+'/startvideo?force=1&mode=circular&tag='+encodeURIComponent($('#video_tag').val()))
    .done(function(data){ $('#rec_circular').removeClass('disabled'); updateVideoInfo(data); })
    .fail(function(xhr, txt){ display_error("start_video_error", "")(xhr, txt); $('#rec_circular').removeClass('disabled'); })

    $('#rec_circular').addClass('disabled');
  });

  $('[name=video_mode_sel]').change(onVideoModeChange);
  $('[name=audio_mode_sel]').change(onAudioModeChange);
} // greetInit


//{name: "name", contents: [], newest: undefined, newdate}

var dirs = {}


var hashCode = function(x){
    var hash = 0, i, char;
    if (x.length == 0) return hash;
    for (i = 0, l = x.length; i < l; i++) {
        char  = x.charCodeAt(i);
        hash  = ((hash<<5)-hash)+char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

var expandCatW = function(cat) {
  return function() { expandCat(cat) }
}

var catName = function(name) {
  return 'cat_' + hashCode(name);
}

var $cat = function(cat) {
  return $('#'+catName(cat))
}

var expandCat = function(cat, state) {
  var e = $cat(cat);
  var disp = (state == undefined) ? (e.css('display') == 'none') : state;
  if (disp) {
    $cat(cat).css('display','')
  } else {
    $cat(cat).css('display','none')
  }
}


var makeLink = function(dir, name) {
  return root+"/v"+dir+"/"+name;
}

var makeThumb = function(dir, name) {
  if (name.length < 5 || name.substr(name.length-4) == '.jpg') {
    // Credit: udana ekanayake
    return root+'/camera_icon.png'
  }
  return root+"/t"+dir+"/"+name
}

var sortMtime = function(a,b) {
  return (b.mtime | 0) - (a.mtime | 0);
}

var onVideoNavigate = function() {
  $('.directory').each(function(i,x) {
      $(x).hide();
  })
  if (window.location.hash != "") {
    expandCat(window.location.hash.substr(1), true);
  }
}

var explainWebM = function() {
  $('#explain_webm').modal();
}

var selectedFile = {}
var selectedFid = "none"
var cancelRemoval = false

var rmfilew = function(fid,obj) {
  return function() {
    cancelRemoval = false
    $('#remove_video_btn').prop('disabled',false)
    $('#filename').text(obj.name).attr('href', makeLink(obj.path, obj.name));
    $('#remove_modal').modal({'keyboard': true});
    selectedFile = obj;
    selectedFid = fid;
  }
}

var rmdirw = function(fid,obj) {
  return function() {
    cancelRemoval = false
    $('#remove_video_btn').prop('disabled',false)
    $('#filename').text(obj.name).attr('href', '#');
    $('#remove_modal').modal({'keyboard': true});
    selectedFile = obj;
    selectedFid = fid;
  }
}

var loadVideos = function(data) {
  $("#cat_pane").empty();
  for (var i = 0; i<data.length; ++i) {
    v = data[i];
    var cat;
    if (v.path == "") {
      cat = "/";
    } else {
      cat = v.path;
    }
    if (dirs[cat] == undefined) {
      var name = cat.substr(1);
      if (cat == '/') {
        name = translate('unsorted');
      }
      dirs[cat] = {name: name, contents: [], newest: undefined, newdate: undefined};
    }
    var d = dirs[cat]
    d.contents.push(v);
    v.mtime -= 0
    if (d.newdate == undefined || d.newdate < v.mtime) {
      d.newest = v
      d.newdate = v.mtime
    }
  }
  for (var di in dirs) {
    var d = dirs[di]
    d.contents.sort(sortMtime);
    
    var media_body = 
      $('<div class="media-body dirheader">')
      .append($('<h4 class="media-heading">').append($('<a href="#'+di+'">').text(d.name)).click(expandCatW(di)))
      .append(
        $('<p>').text(translate('videos_count', d.contents.length)).append($('<span class="glyphicon glyphicon-trash rm_dir">').click(rmdirw(hashCode(di), d)))
        )
      .append(
        $('<p>')
          .append('<span>').text(translate('last_entry'))
          .append($('<a>').attr('href', makeLink(di, d.newest.name)).text(new Date(d.newdate * 1000).toLocaleString()))
      );
    var media_list = $('<div class="media-list directory" style="display: none;">').attr('id', catName(di))
    media_body.append(media_list);

    for (var ci = 0; ci<d.contents.length; ++ci) {
      c = d.contents[ci]
      var fid = 'fid_' + hashCode(di+'/'+c.name);
      media_list.append(
        $('<div class="media file">').attr('id', fid)
              .append(
                $('<a class="pull-left">').attr('href', root+"/v"+di+"/"+c.name)
                .append($('<img style="width: 128px; height: auto;" />').attr('src', makeThumb(di, c.name) ))
              )
              .append(
                $('<div class="media-body">')
                .append($('<h4 class="media-heading">').append($('<a>').attr('href',root+"/v"+di+"/"+c.name).text(c.name)))
                .append($('<p>').text(translate('changed', new Date(c.mtime * 1000).toLocaleString())))
                .append($('<p>')
                  .append($('<span>').text(translate('file_size', (c.size / (1024.0 * 1024.0)).toFixed(2) )))
                  .append($('<span class="glyphicon glyphicon-trash rm_file">').click(rmfilew(fid, c)))
                )
              )
      )
    }

    $('#cat_pane')
      .append(
        $('<div class="media">').attr('id', hashCode(di))
          .append(
            $('<a href="#'+di+'" class="pull-left">')
              .append($('<img style="width: 128px; height: auto;" />').attr('src', makeThumb(di, d.newest.name) ))
              .click(expandCatW(di))
          )
          .append(media_body)
      );
  }
  $(window).on('hashchange', onVideoNavigate);
  onVideoNavigate()
  $('#cancel_remove_video_btn').click(function() {
    cancelRemoval = true;
  })
  $('#remove_video_btn').click(function() {
    if (selectedFile.contents) {
      // Remove the whole directory
      $('#remove_video_btn').prop('disabled',true)
      var jobs = []
      $.each(selectedFile.contents, function(i,selectedFile) {
        jobs.push(function(selectedFile) {
          return function() {
            $.post(root+'/remove'+selectedFile.path+'/'+selectedFile.name)
              .done(function() {
                var next = jobs.pop()
                if (next) {
                  next()
                } else {
                  $('#remove_modal').modal('hide');
                  $('#'+selectedFid).slideUp()
                }
              })
              .error(function() {
                window.alert(translate("cannot_remove_file"))
              })
          }
        }(selectedFile))
      });
      jobs.pop()()
    } else {
      $.post(root+'/remove'+selectedFile.path+'/'+selectedFile.name)
      .done(function() {
        $('#remove_modal').modal('hide');
        $('#'+selectedFid).slideUp()
      })
      .error(function() {
        window.alert(translate("cannot_remove_file"))
      })
    }
  })
}

var videoMgrInit = function() {
  $.ajax(root+'/list_videos')
    .error(function(xhr, textStatus, errorThrown) {
      $('#init_error').text('"'+textStatus+'"');
      $('#init_alert').show();
    })
    .done(loadVideos)
}

var minutes_to_readable = function(minutes) {
  minutes |= 0;
  if (time_map[minutes] != undefined) {
    return time_map[minutes];
  }
  return minutes_template.replace('$VAL', minutes+'')
}

var sensorsMain = function() {
  var data = {};
  var retentionMs = 10000;
  var remoteNow = -1;
  var oldRemoteNow = remoteNow;

  var remoteCheckPoint = -1;

  var timePassedFromCheck = 0;
  var checkPointOffset = -1;

  var redrawPlotHandle = 0;
  var daqHandle = 0;

  var plot = 0;

  var axisMin = 0;
  var axisMax = 1000;

  var availSensors = []
  var activeSensors = []
  /*$.plot('#placeholder', [{label:'pepper', data:[[0,0], [1,1]]}], {
      series: {
        shadowSize: 0 // Drawing is faster without shadows
      },
      yaxis: {
        min: 0,
        max: 100
      },
      xaxis: {
        show: false
      }
    });*/

  var minmax = {
    'accel': [-50, 50],
    'mag': [-60, 60],
    'gyro': [-20, 20],
    'light': [0, 90],
    'pressure': [800, 1100],
    'temp': [-50, 50],
    'proximity': [0, 50],
    'gravity': [-10, 10],
    'lin_accel': [-40, 40],
    'rot_vector': [-1, 1],
    'humidity': [-50, 50],
    'ambient_temp': [-50, 50],
    'motion': [0, 1000],
    'motion_event': [-0.1, 1.1],
    'motion_active': [-0.1, 1.1],
    'battery_level': [0, 100],
    'battery_voltage': [0, 10],
    'battery_temp': [-20, 70],
    'sound': [0, 300],
    'sound_event': [-0.1, 1.1],
    'sound_timeout': [-0.1, 1.1]
  }

  var shiftData = function(pdata, time) {
    for (var i = 0; i<pdata.length; ++i) {
      pdata[i][0] -= time;
    }
    return pdata;
  }


  var convertToPlot = function(newdata) {
    var ret = [];
    if (newdata[0] == undefined) {
      return ret;
    }
    var len = newdata[0][1].length;
    for (var i = 0; i<len; ++i) {
      ret.push([]);
    }
    for (var j=0; j<newdata.length; ++j) {
      var cell = newdata[j];
      var d = cell[1];
      var stamp = cell[0];
      for (var i = 0; i<len; ++i) {
        ret[i].push([stamp, d[i]]);
      }
      remoteNow = Math.max(remoteNow, stamp);
    }
    return ret;
  };


  var oldRedrawTime = -1;


  var getPlotData = function() {
    var now = Date.now();
    var shift = now - oldRedrawTime;
    if (oldRedrawTime == -1)
      shift = 0;
    oldRedrawTime = now;

    
    timePassedFromCheck += shift;
    for (var s in data) {
      var g = data[s];
      shiftData(g.data, shift);
    }
    var parr = [];
    for (var s in data) {
      for (var as = 0; as<activeSensors.length; ++as) {
        var j = activeSensors[as];
        if (s.substr(0,j.length) == j)
          parr.push(data[s]);
      }
    }
    return parr;
  }

  var redrawPlot = function() {
    var parr = getPlotData()
    plot.setData(parr);
    plot.draw();
    redrawPlotHandle = setTimeout(function(){redrawPlot()}, 20);
  }

  var appendData = function(newdata) {
    var cache = {};
    for (var s in newdata) {
      cache[s] = convertToPlot(newdata[s].data);
    }
    //$("#debug1").text(Date.now() - remoteNow);
    //var additionalShift = remoteNow - oldRemoteNow - estimatedShift;
    var cpShift = remoteCheckPoint + checkPointOffset + timePassedFromCheck;
    //$('#debug1').text(additionalShift);
    estimatedShift = 0;
    for (var s in newdata) {
      var pdata = cache[s];
      for (var i = 0; i<pdata.length; ++i) {
        var g = data[s+'.'+i];

        //shiftData(g.data, additionalShift);
        for (var shift = 0; shift<g.data.length; ++shift) {
          if (g.data[shift][0] > 1) {
            if (shift != 0)
              g.data = g.data.slice(shift-1);
            break;
          }
        }
        g.data = g.data.concat(shiftData(pdata[i], cpShift));
      }
    }
    oldRemoteNow = remoteNow;
    /*var parr = [];
    for (var s in data) {
      parr.push(data[s]);
    }
    plot.setData(parr);
    plot.draw();*/
  }

  var checkBoxChange = function() {
    activeSensors = []
    var newMin = 999999;
    var newMax = -999999;
    for (var i in availSensors) {
      var s = availSensors[i];
      if ($('#id'+s).is(':checked')) {
        activeSensors.push(s);
        if (minmax[s] != undefined) {
          newMin = Math.min(newMin, minmax[s][0]);
          newMax = Math.max(newMax, minmax[s][1]);
        }
      }
    }
    if (newMax > 0 && (axisMin != newMin || axisMax != newMax)) {
      axisMin = newMin;
      axisMax = newMax;
    }
    redrawPlotAxis();
  }

  var redrawPlotAxis = function() {
    // [data['accel.0'].data]

    var parr = getPlotData();

    plot = $.plot('#placeholder', 
      parr,
      {
        series: {
          shadowSize: 0 // Drawing is faster without shadows
        },
        yaxis: {
          min: axisMin,
          max: axisMax
        },
        xaxis: {
          //show: false,
          min: 0,
          max: retentionMs
        }
      }
    );

    plot.setupGrid();
    plot.draw()
  }


  var updateSelection = function(newdata) {
    //alert(JSON.stringify(newdata))
    var choiceContainer = $("#checkboxes");
    
    var cache = {};
    availSensors = []
    for (var s in newdata) {
      choiceContainer.append(
        "<div class='checkbox'><label for='id" + s + "'><input type='checkbox' name='" + s +
        "' checked='checked' id='id" + s + "'></input>"
        + translate('sensor_'+s) + "</label></div>");
      availSensors.push(s);
      $('#id'+s).change(checkBoxChange);
      var pdata = convertToPlot(newdata[s].data);
      cache[s] = pdata;
    }
    checkBoxChange();

    $("#debug1").text(Date.now() - remoteNow);
    checkPointOffset = -retentionMs;
    remoteCheckPoint = remoteNow;

    for (var s in newdata) {
      var pdata = cache[s];
      for (var i = 0; i<pdata.length; ++i) {
        data[s+'.'+i] = {
          label: ((newdata[s].desc == undefined ? s : newdata[s].desc[i])+", "+translate('sensor_unit_'+newdata[s].unit)), 
          data: shiftData(pdata[i], remoteCheckPoint + checkPointOffset)
        };
      }
    }
    redrawPlotAxis();
    oldRemoteNow = remoteNow;
  }

  var updatePlot = function() {
    if (activeSensors.length == 0)
    {
      daqHandle = setTimeout(function(){updatePlot()},  100);
    } else {
      $.ajax(root + '/sensors.json?from=' + oldRemoteNow + '&sense=' + activeSensors.join())
       .done(function(data) {
          appendData(data);
          daqHandle = setTimeout(function(){updatePlot()},  100);
       });
     }
  }

  var gpsHandle = -1;

  var hideGps = function () {
    $(".loc-opt").hide()
    clearTimeout(gpsHandle)
  }

  var showGps = function () {
    $(".loc-opt").show()
    gpsHandle = setTimeout(function () {
      $.ajax(root + '/gps.json')
      .done(function (data) {
        if (data.gps) {
          $('#lat').text(data.gps.latitude)
          $('#long').text(data.gps.longitude)
          $('#gmaps_link').attr("href", "https://www.google.com/maps/preview?q="+data.gps.latitude+","+data.gps.longitude);
        }
      })
    }, 2000)
  }

  $.ajax(root + '/status.json')
  .done(function(data) {
    $('#motion_limit').val(data.curvals.motion_limit)
    $('#adet_limit').val(data.curvals.adet_limit)
    var gps_active = (data.curvals.gps_active == "on")
    if (gps_active) {
      showGps()
    }

    var gpscb = $('#gpscb')
      .attr("checked", gps_active)
      .change(function() {
        if (gpscb.is(":checked")) {
          $.ajax(root+'/settings/gps_active?set=on').fail(display_error('cannot_set', 'gps')).done(function () {
            showGps();
          })
        } else {
          $.ajax(root+'/settings/gps_active?set=off').fail(display_error('cannot_set', 'gps'))
          hideGps();
        }
      })
  })
  var sensitivity_apply = function (btn_id, url, value_id) {
    $(btn_id).click(function() {
      $.ajax(root + '/settings/' + url + '?set=' + $(value_id).val())
        .always(function() {
           $('#photo_spinner').css('display', 'none')
        })
        .done(function() {
           $('#photo_ok').fadeIn('slow', function() {
            $('#photo_ok').fadeOut('slow')
           })
        })
        $('#photo_spinner').fadeIn('fast')
    })
  }

  sensitivity_apply('#motion_apply', 'motion_limit', '#motion_limit');
  sensitivity_apply('#adet_apply', 'adet_limit', '#adet_limit');
  

  $.ajax(root + '/sensors.json') // ?from=8999999999999999999
    .done(function(data) {
      var hasKeys = false;

      for (var k in data) {
        hasKeys = true;
        break;
      }
      if (hasKeys) {
        updateSelection(data);
        daqHandle = setTimeout(function(){updatePlot()}, 100);
        redrawPlotHandle = setTimeout(function(){redrawPlot()}, 100);
      } else {
        $('#init_warning').show();
      }
    })
    .error(function(xhr, textStatus, errorThrown) {
      $('#init_error').text('"'+textStatus+'"');
      $('#init_alert').show();
    });
    // End init
}




var rszOnAq = true;
var switchAspect = false;

function loadImage(e) {
  var oldshowing = showing;
  showing = working;
  working = oldshowing;
  showing.unbind()
  showing.css("zIndex", 1);
  if (rszOnAq)
  {
    rszOnAq = false;
    onJsResize();
  }
  loadFeed();
}

function loadJsWindowed()
{
  rszOnAq = false;
  initJsAq();
}

function initJsAq()
{
  working = $("#img1");
  showing = $("#img2");
  loadFeed();
}

function loadFeed() {
  working.css("zIndex", -1);
  working.load(loadImage);
  working.attr("src","/shot.jpg?rnd="+Math.floor(Math.random()*1000000));
}

function onJsResize() {
    if (showing == null)
        return;
    var width = $(window).width();
    var height = $(window).height();
    var paspect = (showing.width()+0.0)/showing.height();
    var waspect = ($(window).width()+0.0)/$(window).height();
    var aspectDep = (paspect > waspect)
    var pic1 = $("#img1");
    var pic2 = $("#img2");
    if (switchAspect)
        aspectDep = !aspectDep;
    if (aspectDep)
    {
        pic1.css('width', width)
        pic2.css('width', width)
        pic1.css('height', '')
        pic2.css('height', '')
    }
    else
    {
        pic1.css('height', height)
        pic2.css('height', height)
        pic1.css('width', '')
        pic2.css('width', '')
    }
}

function swAspect()
{
    switchAspect = !switchAspect;
    onJsResize();
}

function swBAspect()
{
    switchAspect = !switchAspect;
    onBrowserResize();
}

function loadJsFullscreen()
{
    $(window).resize(onJsResize);
    initJsAq();
}

function onBrowserResize() {
    var width = $(window).width();
    var height = $(window).height();
    var showing = $('#img1')
    var paspect = (showing.width()+0.0)/showing.height();
    var waspect = ($(window).width()+0.0)/$(window).height();
    var aspectDep = (paspect > waspect)
    if (switchAspect)
        aspectDep = !aspectDep;
    if (aspectDep)
    {
        showing.css('width', width)
        showing.css('height', '')
    }
    else
    {
        showing.css('height', height)
        showing.css('width', '')
    }
}

function loadBrowserFullscreen()
{
    setInterval(function() { onBrowserResize(); }, 1000);
    $(window).resize(onBrowserResize);
}



function my_url () {
    var port_part = ":" + window.location.port;
    if (port_part == ":80") {
        port_part = "";
    }
    return window.location.protocol + "//" + window.location.hostname + port_part;
}

showHash = function() {
  $('.panel-collapse').collapse('hide')
  if (window.location.hash != "") {
    $(window.location.hash).collapse('show');
  }
}

function initVideoChat() {
  $('.panel-collapse').collapse({'toggle': false})
  $('.repl').each(function (i,el)
  {
    var s = $(el).text();
    s = s.replace(/\$URL\$/g, my_url());
    s = s.replace(/\$IP\$/g, window.location.hostname);
    s = s.replace(/\$PORT\$/g, window.location.port);
    $(el).text(s)
  })
  $('.hash-change').click(function() { setTimeout(function(){ showHash(); }, 100) });
  showHash()
  
}
