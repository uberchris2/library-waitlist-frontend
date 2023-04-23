import { Component } from '@angular/core';
import { Category } from '../category';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  categories: Category[] = [
    { name: 'Pressure Washer', waiting: 3, holding: 2 },
    { name: 'Carpet Cleaner', waiting: 4, holding: 1 },
    { name: 'Roto Tiller', waiting: 0, holding: 0 },
    { name: 'Roto Hammer', waiting: 0, holding: 1 },
    { name: 'Other', waiting: 3, holding: 1 }
  ];
}
