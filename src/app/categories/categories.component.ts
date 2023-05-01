import { Component, ElementRef, ViewChild } from '@angular/core';
import { Category } from '../category';
import { Firestore, collectionData, collection, CollectionReference, doc, DocumentData, setDoc, query, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription, combineLatest, first, map } from 'rxjs';
import { deleteDoc } from '@angular/fire/firestore';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  category$: Observable<Category[]>;
  categoriesCollection: CollectionReference;
  waitHoldCollection: CollectionReference;
  newCategoryName = "";
  searchTerm$ = new BehaviorSubject<string>('');
  @ViewChild('categorySearch', { static: true }) categorySearch!: ElementRef;
  subscriptions: Subscription[] = [];

  constructor(private firestore: Firestore, private modalService: NgbModal) {
    this.categoriesCollection = collection(firestore, 'categories');
    this.waitHoldCollection = collection(firestore, 'wait-holds');
    let unfilteredCategories$ = (collectionData(this.categoriesCollection, { idField: "id" }) as Observable<Category[]>).pipe(
      map(catArr => catArr.sort((catA, catB) => (catB.holding + catB.waiting) - (catA.holding + catA.waiting)))
    );
    this.category$ = combineLatest([unfilteredCategories$, this.searchTerm$]).pipe(
      map(([categories, term]) => categories.filter(category => category.id.toLowerCase().includes(term.toLowerCase())))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  createCategory() {
    setDoc(doc(this.categoriesCollection, this.newCategoryName), <Category>{ id: this.newCategoryName, holding: 0, waiting: 0 })
      .then(() => this.newCategoryName = "");
  }

  deleteCategory(category: Category, deleteCategoryConfirm: any) {
    this.modalService.open(deleteCategoryConfirm).result.then(() => {
      // delete category
      var categoryReference = doc<DocumentData>(this.categoriesCollection, category.id);
      deleteDoc(categoryReference);
      // cancel holds for category
      const whQuery = query(this.waitHoldCollection,
        where("category", "==", category.id),
        where("status", "in", ["Waiting", "Holding"]));
      this.subscriptions.push((collectionData(whQuery, { idField: "id" }) as Observable<WaitHold[]>).pipe(first()).subscribe(whArr => {
        for (var wh of whArr) {
          wh.status = 'Cancelled';
          wh.updated = new Date();
          const waitHoldReference = doc<DocumentData>(this.waitHoldCollection, wh.id);
          setDoc(waitHoldReference, wh);
        }
      }));
    });
  }

  onSearch(term: any) {
    this.searchTerm$.next(term.target.value);
  }

  clearSearch() {
    this.categorySearch.nativeElement.value = '';
    this.searchTerm$.next('');
  }
}
