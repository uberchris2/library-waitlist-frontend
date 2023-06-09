import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesComponent } from './categories/categories.component';
import { AddWaitComponent } from './add-wait/add-wait.component';
import { ExpiredHoldsComponent } from './expired-holds/expired-holds.component';
import { ActivityComponent } from './activity/activity.component';
import { CategoryComponent } from './category/category.component';
import { EditWaitComponent } from './edit-wait/edit-wait.component';
import { UpdateUsersComponent } from './update-users/update-users.component';

const routes: Routes = [
  { path: '', redirectTo: '/categories', pathMatch: 'full' },
  { path: 'categories', component: CategoriesComponent },
  { path: 'category/:categoryId', component: CategoryComponent },
  { path: 'add-wait', component: AddWaitComponent },
  { path: 'add-wait/:categoryId', component: AddWaitComponent },
  { path: 'edit-wait/:waitHoldId', component: EditWaitComponent },
  { path: 'expired-holds', component: ExpiredHoldsComponent },
  { path: 'activity', component: ActivityComponent },
  { path: 'update-users', component: UpdateUsersComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
