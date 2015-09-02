/**
 * Created by majkho on 2015-09-02.
 */

var usage = require('usage');
var options = { keepHistory: true }

var pid = 21730 // you can use any valid PID instead
usage.lookup(pid, function(err, result) {
console.log(result);
});