/*
 * clock.alarm.js
 *
 * Alarm class
 */

function soundStart (index) {
  document.getElementById('audio' + index).play()
}

function soundStop (index) {
  var a = document.getElementById('audio' + index)
  a.pause()
  a.currentTime = 0
}

// constructor
function Alarm (parentNode, days, alarmLabel, onInvalidate, onEdit, onDelete) {
  this.active = false // whether alarm went off
  this.enabled = false // whether alarm is set (can go off)
  this.days = days // bitmask of days
  this.time = 0 // time of day
  this.effectiveTime = 0
  this.snoozeAmount = 0 // if non-zero, override the global snooze time

  this.alarmSetter = document.createElement('div') // Alarm setter
  this.alarmSetter.className = 'alarm'

   // Added by Zach
  this.alarmLabel = document.createElement('h5')
  this.alarmLabel.innerHTML = alarmLabel

  this.link = document.createElement('a') // toggle alarm
  this.link.className = 'active on'
  this.link.setAttribute('href', '#')
  this.toggle = document.createElement('span') // toggle element
  this.toggle.className = 'glyphicon glyphicon-time'
  this.aDisplay = document.createElement('div') // alarm display
  this.aDisplay.className = 'alarm-display'
  this.tDisplay = document.createElement('div') // time display
  this.tDisplay.className = 'time-display'
  this.horizontalPicker = document.createElement('ul') // day picker
  this.horizontalPicker.className = 'day-picker-display horizontal-selector'

  /**
   * This function sets up the days in the day picker display.
   * @param name Days of the Week.
   * @param on Bit mask value for Days.
   */
  function makeDay (name, on) {
    var e = document.createElement('li')
    e.innerHTML = name + ' '
    e.className = on ? 'day active' : 'day'
    return e
  }
  var DOW_LETTERS = 'SMTWTFS'
  this.dow = []
  for (var i = 0; i < 7; ++i) {
    this.horizontalPicker.appendChild(this.dow[i] = makeDay(DOW_LETTERS.charAt(i), days & (1 << i)))
  }

  var thisAlarm = this

  /**
   * This function toggles the alarm
   */
  this.link.onclick = function () {
    if (!thisAlarm.enabled) {
      thisAlarm.link.className = 'active on'
      thisAlarm.enabled = true
      onInvalidate()
    } else {
      thisAlarm.link.className = 'active'
      thisAlarm.enabled = false
      thisAlarm.active = false
      onInvalidate()
      soundStop(thisAlarm.soundIndex)
    }
  }

  // appending alarm elements to the alarm setter
  this.link.appendChild(this.toggle)
  this.aDisplay.appendChild(this.tDisplay)
  this.aDisplay.appendChild(this.horizontalPicker)
  this.editBtn = document.createElement('button')
  this.editBtn.className = 'btn-sm'
  this.editBtn.innerHTML = 'Edit'
  this.deleteBtn = document.createElement('button')
  this.deleteBtn.className = 'btn-sm'
  this.deleteBtn.innerHTML = 'Delete'
  this.deleteBtn.onclick = onDelete
  this.editBtn.onclick = onEdit
  this.alarmSetter.appendChild(this.alarmLabel)
  this.alarmSetter.appendChild(this.link)
  this.alarmSetter.appendChild(this.aDisplay)
  this.alarmSetter.appendChild(this.editBtn)
  this.alarmSetter.appendChild(this.deleteBtn)
  parentNode.appendChild(this.alarmSetter)
}

// other methods
Alarm.prototype = {
  constructor: Alarm,

  /**
   * This function checks the alarms
   */
  check: function (prev, cur) {
     // Skip check if already activated or disabled
    if (this.active || !this.enabled) return false

     // check for correct day
    var okDayP = (this.days & (1 << prev.getDay())) || this.effectiveTime !== this.time
    var okDayC = (this.days & (1 << cur.getDay())) || this.effectiveTime !== this.time

     // check for correct time
    var p = prev.getMsInDay()
    var e = this.effectiveTime.getMsInDay()
    var c = cur.getMsInDay()

     // || of these conditions
     //   p < e < c (use any day)
     //   e < c < p (use cur day)
     //   c < p < e (use prev day)
    if (!(p < e ? (okDayP && (e < c || c < p)) : (okDayC && e < c && c < p))) return false

     // Activate alarm
    this.active = true
    soundStart(this.soundIndex)
    var activeAlarmLabel = document.getElementById('activated-alarm-label')
    activeAlarmLabel.innerHTML = this.alarmLabel.innerHTML
    activeAlarmLabel.className = 'active';

    return true
  },

  /**
   * This function deletes the alarm
   */
  deleted: function () {
     // remove from DOM
    var alarmSetter = this.alarmSetter
    alarmSetter.parentNode.removeChild(alarmSetter)
  },

  /**
   * This function dismisses the alarm
   */
  dismiss: function () {
    if (!this.active) return

    this.active = false
    this.effectiveTime = this.time
    soundStop(this.soundIndex)
    var activeAlarmLabel = document.getElementById('activated-alarm-label')
    activeAlarmLabel.innerHTML = '';
    activeAlarmLabel.className = '';
  },

  /**
   * This function gets the snooze time for the alarm. If no custome snooze time was set
   * it will return a default snooze time.
   * @param defaultTime The default snooze time.
   */
  getSnoozeTime: function (defaultTime) {
    return this.snoozeAmount || (defaultTime * 60000)
  },

  /**
   * This function sets the alarm's time to the alarm's snoozed time.
   * @param until Time using the snooze time value.
   */
  snooze: function (until) {
    if (!this.active) return

    this.dismiss()
    var activeAlarmLabel = document.getElementById('activated-alarm-label')
    activeAlarmLabel.innerHTML = '';
    activeAlarmLabel.className = '';
    this.effectiveTime = until
  }
}
