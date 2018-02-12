/*
 * clock.js
 *
 * Functionality code for our project, unless we split it into more files.
 *
 * This file is formatted according to the JavaScript Standard Style.
 *   Validate this file at
 *     http://standardjs.com/demo
 */

// imports
/* global FakeTime, Alarm, picker, openAlarmPicker, closeAlarmPicker, updateAnalogClock */

(function () {
  // Convenience method - we can use jQuery in the future if needed
  function $id (id) { return document.getElementById(id) }

  var AlarmManager = {
    fakeTime: undefined, // current FakeTime
    lastRealTime: undefined, // real time of last update (Date object)
    alarms: [], // Array of alarms
    editingAlarm: undefined, // which alarm is being edited, undefined for adding alarms

    discreteSeconds: false, // whether subseconds should be truncated
    twentyFour: false, // whether we should use 24-h time

    /**
     * This function updates the simulated time when the time scale is used.
     */
    updateFakeTime: function () {
      // update fake time
      var now = new Date()
      var dt = now - AlarmManager.lastRealTime
      AlarmManager.lastRealTime = now
      var prevFakeTime = AlarmManager.fakeTime
      var timeScale = Math.pow(10, +$id('timeScale').value / 100)
      $id('timeScaleCur').innerHTML = timeScale.toFixed(2)
      AlarmManager.fakeTime = AlarmManager.fakeTime.add(dt * timeScale)

      // check alarms
      for (var i = 0; i < AlarmManager.alarms.length; ++i) {
        var alarm = AlarmManager.alarms[i]
        if (alarm.check(prevFakeTime, AlarmManager.fakeTime)) {
          AlarmManager.invalidate()
        }
      }
    },

    /**
     * This function deletes the specific alarm.
     * @param alarm The alarm to be deleted.
     */
    deleteAlarm: function (alarm) {
      // delete from array
      AlarmManager.alarms.splice(AlarmManager.alarms.indexOf(alarm), 1)
      // delete from DOM
      alarm.deleted()
    },

    /**
     * This function updates the time being displayed.
     */
    updateTimeDisplay: function () {
      var d = AlarmManager.fakeTime.getDay() // day
      var h = AlarmManager.fakeTime.getHours() // hours
      var m = AlarmManager.fakeTime.getMinutes() // minutes
      var s = AlarmManager.fakeTime.getSeconds() // seconds
      updateAnalogClock(h, m, AlarmManager.discreteSeconds ? s : AlarmManager.fakeTime.getSecondsFractional())

      var ampm = ''
      if (!AlarmManager.twentyFour) {
        // transform to 12-hour
        ampm = 'AM'
        if (h >= 12) {
          ampm = 'PM'
          h -= 12
        }
        if (!h) h = 12
      }

      // set 12-hour clock
      if (h < 10) h = '0' + h
      if (m < 10) m = '0' + m
      if (s < 10) s = '0' + s

      $id('curH').innerHTML = h
      $id('curM').innerHTML = m
      $id('curS').innerHTML = s
      $id('curAMPM').innerHTML = ampm

      // set day of week
      $id('curDOW').className = 'cur-dow' + d
    },
    fullUpdate: false, // whether complete update is necessary
    invalidate: function () { AlarmManager.fullUpdate = true },
    /**
     * This function updates the simulated and displayed time. When fullUpdate
     * is true, it will check for any active alarms and enable or disable the dismiss
     * and snooze accordingly.
     */
    update: function () {
      AlarmManager.updateFakeTime()
      AlarmManager.updateTimeDisplay()
      if (!AlarmManager.fullUpdate) return

      var anyActive = false
      for (var i = 0; i < AlarmManager.alarms.length; ++i) {
        if (AlarmManager.alarms[i].active) {
          anyActive = true
        }
      }

      $id('dismiss').disabled = !anyActive
      $id('snooze').disabled = !anyActive

      AlarmManager.fullUpdate = false
    },
    /**
     * This function dismisses all the alarms that are currently going off.
     */
    dismissAll: function () {
      for (var i = 0; i < AlarmManager.alarms.length; ++i) {
        AlarmManager.alarms[i].dismiss()
      }
      AlarmManager.invalidate()
    },
    /**
     * This function snoozes all the alarms that are currently going off.
     */
    snoozeAll: function () {
      for (var i = 0; i < AlarmManager.alarms.length; ++i) {
        var alarm = AlarmManager.alarms[i]
        var snoozeAmount = alarm.getSnoozeTime($id('defaultSnooze').value)
        var until = AlarmManager.fakeTime.add(snoozeAmount)
        alarm.snooze(until)
      }
      AlarmManager.invalidate()
    },
    /**
     * This function adds an alarm.
     */
    addAlarm: function () {
      var days = 0
      for (var i = 6; i >= 0; --i) {
        days <<= 1
        days |= ($id('day-picker' + i).className === 'active' ? 1 : 0)
      }

      // grab alarm label - added by Zach
      var alarmLabel = ($id('alarm-label').value)

      var thisAlarm // The alarm that will be added to the alarms array

      var onInvalidate = AlarmManager.invalidate
      function onEdit () {
        AlarmManager.editingAlarm = thisAlarm
        $id('set-alarm-set').innerHTML = 'Save'
        openAlarmPicker()

        // set alarm label
        document.getElementById("alarm-label").value = thisAlarm.alarmLabel.innerHTML;
      }
      function onDelete () {
        AlarmManager.deleteAlarm(thisAlarm)
      }
      thisAlarm = new Alarm($id('alarms'), days, alarmLabel, onInvalidate, onEdit, onDelete) // new alarm
      AlarmManager.alarms.push(thisAlarm) // pushing alarm into the array
      AlarmManager.invalidate()

      var h = picker.data.hour.current // hour
      var m = picker.data.minute.current // minute
      thisAlarm.time = new FakeTime(((h * 60) + m) * 60000)
      thisAlarm.effectiveTime = thisAlarm.time
      thisAlarm.snoozeAmount = 60000 * $id('alarm-snooze-set').value
      thisAlarm.days = days
      thisAlarm.enabled = true
      closeAlarmPicker()
      if (h === 24) h = 12
      if (h < 10) h = '0' + h
      if (m < 10) m = '0' + m
      thisAlarm.tDisplay.innerHTML = h + ':' + m // display the alarm time on the alarm list
      thisAlarm.soundIndex = $id('alarm-tone-input').value // set alarm tone
    },
    /**
     * This function edits an alarm
     */
    editAlarm: function () {
      var days = 0
      for (var i = 6; i >= 0; --i) {
        days <<= 1
        days |= ($id('day-picker' + i).className === 'active' ? 1 : 0)
      }

      var alarm = AlarmManager.editingAlarm // alarm to be edited
      var alarmLabel = ($id('alarm-label').value)
      for (i = 0; i < 7; ++i) {
        alarm.dow[i].className = days & (1 << i) ? 'day active' : 'day'
      }
      alarm.alarmLabel.innerHTML = alarmLabel // update the alarm label

      var h = picker.data.hour.current // hours
      var m = picker.data.minute.current // minutes
      alarm.time = new FakeTime(((h * 60) + m) * 60000)
      alarm.effectiveTime = alarm.time
      alarm.snoozeAmount = 60000 * $id('alarm-snooze-set').value
      alarm.days = days
      alarm.enabled = true
      closeAlarmPicker()
      if (h === 24) h = 12
      if (h < 10) h = '0' + h
      if (m < 10) m = '0' + m
      alarm.tDisplay.innerHTML = h + ':' + m // display the alarm time on the alarm list
      alarm.soundIndex = $id('alarm-tone-input').value // update the alarm tone
      $id('set-alarm-set').innerHTML = 'Set Alarm'
      AlarmManager.editingAlarm = undefined
    },
    /**
     * this function initializes the clock
     */
    init: function () {
      // Set initial time
      AlarmManager.lastRealTime = new Date()
      AlarmManager.fakeTime = FakeTime.fromDate(AlarmManager.lastRealTime)

      // event handlers
      $id('dismiss').onclick = function () {
        if ($id('dismiss-challenge').checked) {
          var ok = false
          // ask up to 5 times
          for (var i = 0; i < 5; ++i) {
            var a = ((Math.random() * 5) | 0) + 1
            var b = 5 - (a === 5) // limit total to 9
            b = ((Math.random() * b) | 0) + 1
            if (+window.prompt('What is ' + a + ' + ' + b + '?') === (a + b)) {
              ok = true
              break
            }
          }
          if (!ok) return
        }

        AlarmManager.dismissAll()
      }
      $id('snooze').onclick = function () { AlarmManager.snoozeAll() }
      $id('addAlarm').onclick = function () { AlarmManager.addAlarm() }

      // 100Hz is overkill, but it works
      setInterval(AlarmManager.update, 10)

      // more init
      var $discreteSwitch = $id('discrete-switch') // discrete switch
      /**
       * This function switches the analog clock from continuous to discrete
       */
      $discreteSwitch.onchange = function () {
        AlarmManager.discreteSeconds = $discreteSwitch.checked
      }
      var $twentyFourSwitch = $id('24-switch') // 24 hour switch
       /**
        * This function switches the time displayed to a 24 hour time.
        */
      $twentyFourSwitch.onchange = function () {
        AlarmManager.twentyFour = $twentyFourSwitch.checked
      }
      var Set = document.getElementById('set-alarm-set') // Set button
      /**
       * This function sets or saves the alarm.
       */
      Set.onclick = function () {
        if (!AlarmManager.editingAlarm) {
          AlarmManager.invalidate()
          AlarmManager.addAlarm()
        } else {
          AlarmManager.editAlarm()
        }
      }

      /**
       * This function resets the time scale.
       */
      $id('timeScaleReset').onclick = function () {
        $id('timeScale').value = 0
      }
    }
  }

  // ready function
  document.addEventListener('DOMContentLoaded', function () {
    AlarmManager.init()
  })

  // exports
  window.AlarmManager = AlarmManager
})()
