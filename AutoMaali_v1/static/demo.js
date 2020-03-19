// A Vue component for our battery adaptive app

Vue.component('app',{
    template: '#app',
    props: ['battery-level'],   // Receives battery levels from global Vue instance.

    computed: { 

        // PowerSavingMode is used in a number places for toggleing content.
        powerSavingMode: function () { 
            return this.batteryLevel < 30;
        },

        // Dark themes save battery life, as screens use less energy to produce darker colors.
        theme: function () {
            return this.powerSavingMode ? 'dark-theme' : 'light-theme';
        }

    }
});


// Global Vue Instance

new Vue({
    el: 'body',

    data: {
        batteryLevel: 60,   // Default value, if Battery API fails to fetch.
        interval: 0         // Used to clear setIntervals.
    },

    methods: {

        // For demo purposes virtual battery levels are used.
        // In reality this data should be handled via the battery API.

        drainBattery: function(e) {

            clearInterval(this.interval);

            this.interval = setInterval(
                function(){
                    if(this.batteryLevel > 20) {
                        this.batteryLevel--;
                    }
                    else{
                        clearInterval(this.interval);
                    }
                }.bind(this)
                ,50);
        },

        rechargeBattery: function(e) {

            clearInterval(this.interval);

            this.interval = setInterval(
                function(){
                    if(this.batteryLevel < 100) {
                        this.batteryLevel++;
                    }
                    else{
                        clearInterval(this.interval);
                    }
                }.bind(this)
                ,50);
        }
    },

    ready: function(){
        var that = this;

        if(navigator.getBattery){

            navigator.getBattery()
            .then(function(battery){
                that.batteryLevel = battery.level * 100;
            })
            .catch(function(e){
                console.error(e);
            });

        }
        else{
            console.log('Battery API not availalble in your browser');
        }
        
    }
});