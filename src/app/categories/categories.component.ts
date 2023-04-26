import { Component } from '@angular/core';
import { Category } from '../category';
import { Firestore, collectionData, collection, addDoc, CollectionReference, DocumentReference, query, queryEqual, documentId, docData, doc, DocumentData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { deleteDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  category$: Observable<Category[]>;
  categoriesCollection: CollectionReference;
  newCategoryName = "";

  constructor(private firestore: Firestore) {
    this.categoriesCollection = collection(firestore, 'categories');
    this.category$ = collectionData(this.categoriesCollection, {idField: "id"}) as Observable<Category[]>;
  }

  createCategory() {
    addDoc(this.categoriesCollection, <Category>{ name: this.newCategoryName, holding: 0, waiting: 0 })
      .then((UNUSED: DocumentReference) => {
        this.newCategoryName = "";
      });
  }

  deleteCategory(category: Category) {
    var categoryReference = doc<DocumentData>(this.categoriesCollection, category.id);
    deleteDoc(categoryReference);
  }
}
