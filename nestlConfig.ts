/* tslint:disable */
// @ts-nocheck

const { writeFile, existsSync, mkdirSync } = require('fs');

const environmentFileContent = `export const environment = {
    firebase: {
        projectId: 'waitlist-firebase',
        appId: '1:346705633941:web:6d3c42bfe3c7955cee319c',
        storageBucket: 'waitlist-firebase.appspot.com',
        apiKey: '${process.env['FIREBASE_API_KEY']}',
        authDomain: 'waitlist-firebase.web.app',
        messagingSenderId: '346705633941',
        measurementId: 'G-J92GC4CZ5N',
    },
    siteName: 'Northeast Seattle Tool Library',
    headerClass: 'bg-primary',
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
