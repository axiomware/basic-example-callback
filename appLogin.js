// Copyright 2017,2018 Axiomware Systems Inc. 
//
// Licensed under the MIT license <LICENSE-MIT or 
// http://opensource.org/licenses/MIT>. This file may not be copied, 
// modified, or distributed except according to those terms.
//

//Add external modules dependencies
var netrunr = require('netrunr-gapi');
var chalk = require('chalk');
var figlet = require('figlet');

var gapi = new netrunr.gapi();  //Create a Netrunr gateway instance(only for login)

//User configuration
var userConfig = {           
    'username': '<ENTER-YOUR-USERNAME>', //Valid username to your Axiomware account
    'pwd': '<ENTER-YOUR-PASSWORD>' //Valid password to your Axiomware account
};

//Monitor ctrl-c events and exit program
process.on("SIGINT", function () {
    axShutdown("Received Ctrl-C - shutting down.. please wait");
});

//Application start - startup banner
console.log(chalk.green.bold(figlet.textSync('NETRUNR GATEWAY', { horizontalLayout: 'default' })));
console.log(chalk.green.bold('Basic Login Application Using Callbacks'));
console.log(chalk.red.bold('Press Ctrl-C to exit'));
axLogin(userConfig.username, userConfig.pwd); // Call the main function

/**
 * Main program entry point
 * 
 * @param {string} user - username of axiomware account
 * @param {string} pwd - password of axiomware account
 */
function axLogin(user , pwd) {
    gapi.login({ 'user': user, 'pwd': pwd },//login into your account
        function (robj) {
            console.log('Login success [user:' + user + ']');
            if (robj.gwid.length > 0) {
                console.log('Found ' + robj.gwid.length + ' Gateway(s)');
                robj.gwid.forEach(function (gw) { console.log(gw) }); // print gateway list
                axOpenConnection(robj.gwid[0]);//open connection to the first gateway in the list
            }
            else {// no gateways fount. Exit
                axShutdown('Found no gateways - exiting (nothing to do)');
            }
        },
        function (robj) {
            axShutdown('Login error!\nCheck the Javascript program file.\nYou need to enter valid credentails for \"username\" and \"pwd\" variables.\nExiting ...');
        });
}

/**
 * Open a connection to a specific Netrunr gateway
 * 
 * @param {string} gwid - gateway ID
 */
function axOpenConnection(gwid) {
    gapi.config({ 'gwid': gwid }); //select gateway

    gapi.open({},//open connection to the gateway
        function (robj) {
            console.log('Connection open to Netrunr gateway [' + gwid + '] success!')
            axGetVersionInfo(gwid);//Get version information
        },
        function (robj) {
            axShutdown('Failed to open connection - exiting');
        }
    );
};

/**
 * Get version information from the Netrunr gateway
 * 
 *  @param {string} gwid - gateway ID
 */
function axGetVersionInfo(gwid) {
    console.log('Fetching version info of [gwid:' + gwid + ']');
    gapi.version({},//get gateway version
        function (robj) {
            axShutdown('Netrunr gateway [' + gwid + '] version = ' + robj.version + '\nAll Done! Exiting program...');//All done.. exit program
        },
        function (robj) {
            axShutdown('Failed to open connection - exiting');
        }
    );
};

/**
 * Gracefully shutdown the connection and logout of the account
 * 
 * @param {string} prnStr - Print this string to console before exiting
 */
function axShutdown(prnStr) {
    console.log(prnStr);
    gapi.close({}, gapi.logout({}, axExit, axExit), gapi.logout({}, axExit, axExit));//close and logout
};

/**
 * Exit the process
 * 
 */
function axExit() {
    process.exit();//exit the process
}
