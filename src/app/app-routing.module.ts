import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesComponent } from './categories/categories.component';
import { AddWaitComponent } from './add-wait/add-wait.component';
import { ExpiredHoldsComponent } from './expired-holds/expired-holds.component';
import { ActivityComponent } from './activity/activity.component';
import { CategoryComponent } from './category/category.component';

const routes: Routes = [
  { path: '', redirectTo: '/categories', pathMatch: 'full' },
  { path: 'categories', component: CategoriesComponent },
  { path: 'category/:categoryName', component: CategoryComponent },
  { path: 'add-wait', component: AddWaitComponent },
  { path: 'add-wait/:categoryName', component: AddWaitComponent },
  { path: 'expired-holds', component: ExpiredHoldsComponent },
  { path: 'activity', component: ActivityComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
