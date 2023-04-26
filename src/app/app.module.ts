import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CategoriesComponent } from './categories/categories.component';
import { AddWaitComponent } from './add-wait/add-wait.component';
import { ExpiredHoldsComponent } from './expired-holds/expired-holds.component';
import { ActivityComponent } from './activity/activity.component';
import { CategoryComponent } from './category/category.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { EditWaitComponent } from './edit-wait/edit-wait.component';
import { UpdateUsersComponent } from './update-users/update-users.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';

@NgModule({
  declarations: [
    AppComponent,
    CategoriesComponent,
    AddWaitComponent,
    ExpiredHoldsComponent,
    ActivityComponent,
    CategoryComponent,
    EditWaitComponent,
    UpdateUsersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    NgxCsvParserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
