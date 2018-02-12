/*
 * clock.faketime.js
 *
 * Internal class for time and day
 */

// constructor
function FakeTime (ms) {
  this.ms = ms
}
// other methods
FakeTime.prototype = {
  constructor: FakeTime,
  getDay: function () { return (this.ms / 86400000) | 0 },
  getHours: function () { return ((this.ms / 3600000) % 24) | 0 },
  getMinutes: function () { return ((this.ms / 60000) % 60) | 0 },
  getSeconds: function () { return this.getSecondsFractional() | 0 },
  getSecondsFractional: function () { return (this.ms / 1000) % 60 },
  getMsInDay: function () { return (this.ms % 86400000) | 0 },
  add: function (msDelta) {
    return new FakeTime((this.ms + msDelta) % 604800000)
  }
}
FakeTime.fromDate = function (date) {
  var ms = date.getDay()
  ms *= 24
  ms += date.getHours()
  ms *= 3600000
  ms += date % 3600000
  return new FakeTime(ms)
}
