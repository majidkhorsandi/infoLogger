# infoLogger

The project is consisted mainly of a REST api and a REST client written in node.js. So for the execution node.js should be installed. The client is collecting some useful information about a given process in the system and POSTs them to the API.
API will receive them and parse the response and save them in a text log file inside the same directory as server.js and monitor.js reside.

Currently following information are collected from the client computer:
- The time information are logged
- Cpu usage by the process in %
- Memory usage by the process in KB
- Total size of memory in the system
- Amount of free memory in the system

To try the project:
- install node.js
- clone the project into a directory.
- Start server.js by running : <sudo> node server.js
- Start monitor.js by running : <sudo> node monitor.js

Notes:
- So far only tested on Mac OS Darwin and Linux Ubuntu 14.04.

