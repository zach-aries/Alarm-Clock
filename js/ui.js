/**
 * Created by Zach on 2017-02-13.
 */

function toggleNavigationMenu(icon) {

    var sidebar = document.getElementById("side-bar");
    var contentWrapper = document.getElementById("content-wrapper");

    if(icon.className.includes("open")){
        sidebar.className = "closed";
        contentWrapper.className = "full-width";

        icon.className = icon.className.replace("open", "closed");
    }else{
        sidebar.className = "open";
        contentWrapper.className = "";
        icon.className = icon.className.replace("closed", "open");
    }
}

function toggleInnerMenu(elem) {

    var settingsMenu = document.getElementById("settings-menu");
    var alarmMenu = document.getElementById("alarm-menu");
    var alarmIcon = document.getElementById("ialarm");
    var settingsIcon = document.getElementById("isettings");

    if( elem.id.includes("isettings") ){
        if(settingsMenu.className.includes("closed")){
            elem.className += " active";
            alarmIcon.className = alarmIcon.className.replace(" active","");

            settingsMenu.className = settingsMenu.className.replace(" closed","");
            alarmMenu.className += " closed";
        }
    }else{
        if(alarmMenu.className.includes("closed")){
            elem.className += " active";
            settingsIcon.className = settingsIcon.className.replace(" active","");


            alarmMenu.className = alarmMenu.className.replace(" closed","");
            settingsMenu.className += " closed";
        }
    }

}

/**
 *  Sets the input box so you can reference its value
 *	use #day-picker to get this information
 * 	you could replace this function with picker function:
 *		picker.getDate()
 */
function setDayOfWeek(day, el) {

    // set multiple days of week
    if(el.className == "active"){
        el.className = "";
    }else{
        el.className += "active";
    }

}

/**
 *  This function closes the picker. Call this the same time use set an alarm
 *  also used in cancel
 */
function closeAlarmPicker() {
    if( !( $( "#alarm-picker-overlay").hasClass("closed") ) ){
        $( "#alarm-picker-overlay" ).addClass( "closed");
    }
    document.getElementById('set-alarm-set').innerHTML = 'Set Alarm'
}

/**
 * This function opens the picker, called in new alarm on the side menu
 */
function openAlarmPicker() {
    // reset stuff
    $("#day-picker a").attr("class", "active");
    $("#alarm-snooze-set").val(0)
    $("#alarm-label").val("Alarm " + (AlarmManager.alarms.length + 1));


    if( $( "#alarm-picker-overlay").hasClass("closed") ){
        $( "#alarm-picker-overlay" ).removeClass( "closed");
    }
}

function editAlarmPicker(){
    if( $( "#alarm-picker-overlay").hasClass("closed") ){
        $( "#alarm-picker-overlay" ).removeClass( "closed");
    }
}

/************************************
 *      ANALOG CLOCK FUNCTIONS
 ************************************/

/**
 * This function updates the analog clock
 *
 * hour 0 - 23
 * minute 0 - 59
 * second 0 - 59
 */
function updateAnalogClock(hour,minute,second) {
    positionSecondHand(second);
    positionMinuteHand(minute, second);
    positionHourHand(hour,minute);
}

/**
 * This function moves the hour hand
 *
 * pass in hour as hours 0 - 23
 * pass in minute as minutes 0 - 59
 *
 */
function positionHourHand(hour, minute) {
    if(hour >= 12)
        hour -= 12
    var deg = 30 * hour;
    deg += minute / 2;

    $("#hour-hand").css("transform", "rotate("+deg+"deg)");
}

/**
 * This function moves the minute hand
 *
 * pass in minute as minutes 0-59
 * pass in second as seconds 0-59
 *
 */
function positionMinuteHand(minute, second) {
    var deg = 6 * minute;
    deg += second / 10;
    $("#minute-hand").css("transform", "rotate("+deg+"deg)");
}

/**
 * This function moves the second hand
 *
 * pass in seconds as seconds 0-59
 *
 */
function positionSecondHand(second) {
    var deg = 6 * second;
    $("#second-hand").css("transform", "rotate("+deg+"deg)");
}
