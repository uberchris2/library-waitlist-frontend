/* tslint:disable */
// @ts-nocheck

const { writeFile, existsSync, mkdirSync } = require('fs');

const environmentFileContent = `export const environment = {
    firebase: {
        projectId: 'waitlist-shoreline',
        appId: '1:349825777508:web:0e3f97fdba03ac5cf0c471',
        storageBucket: 'waitlist-shoreline.appspot.com',
        apiKey: '${process.env['FIREBASE_SHORELINE_API_KEY']}',
        authDomain: 'waitlist-shoreline.web.app',
        messagingSenderId: '349825777508',
        measurementId: 'G-0V6P6Q9RTV',
        siteName: 'Shoreline Tool Library',
    },
    siteName: 'Shoreline Tool Library',
    headerClass: 'bg-success',
    openDays: [1, 3, 5, 6],
    production: true,
};
`;

// creates the `environments` directory if it does not exist
const envDirectory = './src/environments';
if (!existsSync(envDirectory)) {
    mkdirSync(envDirectory);
}

writeFile('./src/environments/environment.ts', environmentFileContent, function (err) {
    if (err) {
        console.log(err);
    }
    console.log(`wrote variables`);
});
