/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxCsvParserModule } from 'ngx-csv-parser';
import { provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideFunctions, getFunctions, connectFunctionsEmulator } from '@angular/fire/functions';
import { environment } from './environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
            BrowserModule,
            AppRoutingModule,
            NgbModule,
            FormsModule,
            NgxCsvParserModule,
            ClipboardModule
        ),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => {
            const auth = getAuth();
            if (!environment.production && environment.emulated) {
                connectAuthEmulator(auth, 'http://localhost:9099');
            }
            return auth;
        }),
        provideFirestore(() => {
            const firestore = getFirestore();
            if (!environment.production && environment.emulated) {
                connectFirestoreEmulator(firestore, 'localhost', 8080);
            }
            return firestore;
        }),
        provideFunctions(() => {
            const functions = getFunctions();
            if (!environment.production && environment.emulated) {
                connectFunctionsEmulator(functions, 'localhost', 5001);
            }
            return functions;
        })
    ]
})
  .catch(err => console.error(err));
