$(document).ready(function() {
    $(document).on('click','#cc1',function() {
        $.ajax({
            url: '/camerac1',
            type: 'POST',
            success: function(response) {
                    console.log("CC1");
                    document.getElementById("error").innerHTML =response.substr(1,response.length-2);
                },
            error: function(error) {
                console.log("CC1");
                console.log(error);
            }
        });
    });
	$(document).on('click','#cc2',function() {
        $.ajax({
            url: '/camerac2',
            type: 'POST',
            success: function(response) {
                    console.log("CC2");
                    document.getElementById("error").innerHTML =response.substr(1,response.length-2);
                },
            error: function(error) {
                console.log("CC2");
                console.log(error);
            }
        });
    });
	$(document).on('click','#cc3',function() {
        $.ajax({
            url: '/camerac3',
            type: 'POST',
            success: function(response) {
                    console.log("CC3");
                    document.getElementById("error").innerHTML =response.substr(1,response.length-2);
                },
            error: function(error) {
                console.log("CC3");
                console.log(error);
            }
        });
    });
	$(document).on('click','#cc4',function() {
        $.ajax({
            url: '/camerac4',
            type: 'POST',
            success: function(response) {
                    console.log("CC4");
                    document.getElementById("error").innerHTML =response.substr(1,response.length-2);
                },
            error: function(error) {
                console.log("CC4");
                console.log(error);
            }
        });
    });
	$(document).on('click','#cc5',function() {
        $.ajax({
            url: '/camerac5',
            type: 'POST',
            success: function(response) {
                    console.log("CC5");
                    document.getElementById("error").innerHTML =response.substr(1,response.length-2);
                },
            error: function(error) {
                console.log("CC5");
                console.log(error);
            }
        });
    });
	$(document).on('click','#bc1',function() {
        $.ajax({
            url: '/botc1',
            type: 'POST',
            success: function(response) {
                    document.getElementById("error").innerHTML =response.substr(1,response.length-2);
                },
            error: function(error) {
                console.log(error);
            }
        });
    });
	$(document).on('click','#bc2',function() {
        $.ajax({
            url: '/botc2',
            type: 'POST',
            success: function(response) {
                    document.getElementById("error").innerHTML =response.substr(1,response.length-2);
                },
            error: function(error) {
                console.log(error);
            }
        });
    });
	$(document).on('click','#bc3',function() {
        $.ajax({
            url: '/botc3',
            type: 'POST',
            success: function(response) {
                    document.getElementById("error").innerHTML =response.substr(1,response.length-2);
                },
            error: function(error) {
                console.log(error);
            }
        });
    });
	$(document).on('click','#bc4',function() {
        $.ajax({
            url: '/botc4',
            type: 'POST',
            success: function(response) {
                    document.getElementById("error").innerHTML =response.substr(1,response.length-2);
                },
            error: function(error) {
                console.log(error);
            }
        });
    });
	$(document).on('click','#bc5',function() {
        $.ajax({
            url: '/botc5',
            type: 'POST',
            success: function(response) {
                    document.getElementById("error").innerHTML =response.substr(1,response.length-2);
                },
            error: function(error) {
                console.log(error);
            }
        });
    });
});
