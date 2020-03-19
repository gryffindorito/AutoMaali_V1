$(document).ready(function() {
    $(document).on('click','#On',function() {
        $.ajax({
            url: '/On',
            type: 'POST',
            success: function(response) {
                    console.log("On");
                    document.getElementById("error").innerHTML =response.substr(1,response.length-2);
                },
            error: function(error) {
                console.log("On");
                console.log(error);
            }
        });
    });
	$(document).on('click','#Off',function() {
        $.ajax({
            url: '/Off',
            type: 'POST',
            success: function(response) {
                    console.log("Off");
                    document.getElementById("error").innerHTML =response.substr(1,response.length-2);
                },
            error: function(error) {
                console.log("Off");
                console.log(error);
            }
        });
    });
});
