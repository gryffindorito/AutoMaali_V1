
/*
'select_video_mode_first'
'unsorted' // videos
'videos_count' %1
'last_entry' %1
'changed' %1
'file_size' %1
translate("cannot_remove_file")
*/

var translate = function(txt, arg1, arg2, arg3) {
	var translated = {
		"exposure_lock_on": "Enabled",
		"exposure_lock_off": "Disabled",
		"whitebalance_lock_on": "Enabled",
		"whitebalance_lock_off": "Disabled",

    "orientation_landscape": "Landscape",
    "orientation_portrait": "Portrait",
    "orientation_upsidedown": "Upside down",
    "orientation_upsidedown_portrait": "Upside down portrait",

    "mirror_flip_none": "None",
    "mirror_flip_mirror": "Mirror",
    "mirror_flip_flip": "Flip",
    "mirror_flip_mirror,flip": "Mirror, Flip",

  	"changed": "Changed: %1",
  	"file_size": "File size: %1 Mb ",
  	"last_entry": "Last entry: ",
  	"select_video_mode_first": "Select video mode first!",
  	"unsorted": "Unsorted",
  	"videos_count": "Files: %1",
  	
  	
  	"whitebalance_": "",
	  	"whitebalance_auto": "Auto",
	  	"whitebalance_cloudy-daylight": "Cloudy daylight",
	  	"whitebalance_daylight": "Daylight",
	  	"whitebalance_fluorescent": "Fluorescent",
	  	"whitebalance_incandescent": "Incandescent",
	  	"whitebalance_shade": "Shade",
	  	"whitebalance_twilight": "Twilight",
	  	"whitebalance_warm-fluorescent": "Warm fluorescent",
	  	
	"flashmode_": "",
	  	"flashmode_auto": "Auto flash",
	  	"flashmode_off": "Flash disabled",
	  	"flashmode_on": "Always use flash",
	  	"flashmode_red-eye": "Red-eye reduction mode",
	  	"flashmode_torch": "Flashlight mode",
	  	
	"focusmode_": "",
	  	"focusmode_auto": "Manual",
	  	"focusmode_continuous-picture": "Aggressive, for taking photos",
	  	"focusmode_continuous-video": "Smooth, for recording video",
	  	"focusmode_edof": "Extended depth of field, continuous",
	  	"focusmode_fixed": "Fixed",
	  	"focusmode_infinity": "Infinity",
	  	"focusmode_macro": "Macro, manual",
	  	"focusmode_normal": "Normal",
	  	
	"scenemode_": "",
	  	"scenemode_AR": "Augmented reality",
	  	"scenemode_action": "Fast-moving objects",
	  	"scenemode_asd": "Autosense darkness",
	  	"scenemode_auto": "Auto",
	  	"scenemode_backlight": "Backlight",
	  	"scenemode_barcode": "Barcode reading",
	  	"scenemode_beach": "Beach",
	  	"scenemode_candlelight": "Candle light",
	  	"scenemode_fireworks": "Fireworks",
	  	"scenemode_flowers": "Flower",
	  	"scenemode_hdr": "HDR",
	  	"scenemode_landscape": "Landscape",
	  	"scenemode_night": "Night",
	  	"scenemode_night-portrait": "Night portrait",
	  	"scenemode_party": "Party",
	  	"scenemode_portrait": "Portrait",
	  	"scenemode_snow": "Snow",
	  	"scenemode_sports": "Sports",
	  	"scenemode_steadyphoto": "Avoid blurry pictures",
	  	"scenemode_sunset": "Sunset",
	  	"scenemode_theatre": "Theatre",
	  	
	"coloreffect_": "",
	  	"coloreffect_aqua": "Aqua",
	  	"coloreffect_blackboard": "Blackboard",
	  	"coloreffect_emboss": "Embossing",
	  	"coloreffect_mono": "Black and white",
	  	"coloreffect_negative": "Negative",
	  	"coloreffect_neon": "Neon",
	  	"coloreffect_none": "No effects",
	  	"coloreffect_posterize": "Posterization",
	  	"coloreffect_sepia": "Sepia",
	  	"coloreffect_sketch": "Sketch",
	  	"coloreffect_solarize": "Solarization",
	  	"coloreffect_whiteboard": "Whiteboard",
	  	
	"antibanding_": "",
	  	"antibanding_50hz": "50 Hz",
	  	"antibanding_60hz": "60 Hz",
	  	"antibanding_auto": "Auto",
	  	"antibanding_off": "Off",
	  	
	"sensor_": "",
	  	"sensor_accel": "Accelerometer",
	  	"sensor_ambient_temp": "Ambient temperature",
	  	"sensor_battery_level": "Battery level",
	  	"sensor_battery_temp": "Battery temperature",
	  	"sensor_battery_voltage": "Battery voltage",
	  	"sensor_gravity": "Gravity sensor",
	  	"sensor_gyro": "Gyroscope",
	  	"sensor_humidity": "Relative humidity",
	  	"sensor_light": "Light sensor",
	  	"sensor_lin_accel": "Linear acceleration",
	  	"sensor_mag": "Magnetic field",
	  	"sensor_motion": "Motion amount",
	  	"sensor_motion_active": "Motion active",
	  	"sensor_motion_event": "Motion reported",
	  	"sensor_pressure": "Pressure",
	  	"sensor_proximity": "Proximity sensor",
	  	"sensor_rot_vector": "Rotation vector",
	  	"sensor_sound": "Sound sensor",
	  	"sensor_temp": "Temperature",
	  	
	"sensor_unit_": "",
	  	"sensor_unit_V": "V",
	  	"sensor_unit_\%": "\%",
	  	"sensor_unit_cm": "cm",
	  	"sensor_unit_dB": "dB",
	  	"sensor_unit_lx": "lx",
	  	"sensor_unit_m/sÂ²": "m/sÂ²",
	  	"sensor_unit_mbar": "mbar",
	  	"sensor_unit_rad/s": "rad/s",
	  	"sensor_unit_ÂµT": "ÂµT",
	  	"sensor_unit_â„ƒ": "â„ƒ",
	  	
	
	
  
	'#placeholder#': 'none'
  	}[txt]
  	if (translated == undefined)
  		translated = txt;

    return (translated)
      .replace('%1', arg1)
      .replace('%2', arg2)
      .replace('%3', arg3)
}

var minutes_template = "$VAL minutes";

var time_map = {
	1: "1 minute",
	5: "5 minutes",
	10: "10 minutes",
	30: "30 minutes",
	60: "1 hour",
	120: "2 hours"
};