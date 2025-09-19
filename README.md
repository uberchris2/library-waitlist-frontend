# LibraryWaitlist

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.6.

## Development server
ng build --configuration=development
docker build -t waitlist-frontend-ssl .
docker run -p 443:443 waitlist-frontend-ssl


To see actual data make your email is added to 
Firebase > Build > Filestore Database > Rules
 https://console.firebase.google.com/project/waitlist-shoreline/firestore/databases/-default-/rules


Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

To connect to a firebase project successfully make sure you've taken these steps. 
1) Become an editor on the project
    a) Firebase Console https://console.firebase.google.com
    b) Settings > Users and Permissions
    c) Add your email as at least an editor
2) To Connect to production firebase add email here: 
    a) consider using use emulated firebase to not risk changing production data, see functions readme for that
    b) Firebase > Build > Filestore Database > Rules
    c) https://console.firebase.google.com/project/waitlist-shoreline/firestore/databases/-default-/rules
     
3) run using ng serve after configuring enviroment.development.ts (git-ignored do not commit)
    a) Get secret keys from project settings > General

## Deploy
    1) Pushing to main runs a build and deploy job for both Shoreline and NESTL. 
    2) To rollback, use firebase hosting. 
        a) The app is deployed to 2 locations, so make sure to rollback both if you need to. 
        b) Filestore > Build > Hosting
        c) https://console.firebase.google.com/project/waitlist-firebase/hosting/sites/waitlist-firebase

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
