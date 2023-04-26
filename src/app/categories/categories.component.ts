import { Component } from '@angular/core';
import { Category } from '../category';
import { Firestore, collectionData, collection, CollectionReference, doc, DocumentData, setDoc } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { deleteDoc } from '@angular/fire/firestore';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  category$: Observable<Category[]>;
  categoriesCollection: CollectionReference;
  newCategoryName = "";

  constructor(private firestore: Firestore, private modalService: NgbModal) {
    this.categoriesCollection = collection(firestore, 'categories');
    this.category$ = (collectionData(this.categoriesCollection, { idField: "id" }) as Observable<Category[]>).pipe(
      map(catArr => catArr.sort((catA, catB) => (catB.holding + catB.waiting) - (catA.holding + catA.waiting)))
    );
  }

  createCategory() {

    setDoc(doc(this.categoriesCollection, this.newCategoryName), <Category>{ id: this.newCategoryName, holding: 0, waiting: 0 })
      .then(() => this.newCategoryName = "");
  }

  deleteCategory(category: Category, deleteCategoryConfirm: any) {
    this.modalService.open(deleteCategoryConfirm).result.then(() => {
      var categoryReference = doc<DocumentData>(this.categoriesCollection, category.id);
      deleteDoc(categoryReference);
    });
  }
}
