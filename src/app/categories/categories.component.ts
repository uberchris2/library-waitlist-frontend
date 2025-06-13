import { Component, ElementRef, ViewChild } from '@angular/core';
import { Category } from '../category';
import { Firestore, collectionData, collection, CollectionReference, doc, DocumentData, setDoc, query, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription, combineLatest, first, map } from 'rxjs';
import { deleteDoc } from '@angular/fire/firestore';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { CategoryWithCounts } from '../category-with-counts';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.css'],
    standalone: true,
    imports: [NgIf, NgFor, RouterLink, NgbPopover, FormsModule, AsyncPipe]
})
export class CategoriesComponent {
  category$: Observable<CategoryWithCounts[]>;
  categoriesCollection: CollectionReference;
  waitHoldCollection: CollectionReference;
  newCategoryName = "";
  searchTerm$ = new BehaviorSubject<string>('');
  @ViewChild('categorySearch', { static: true }) categorySearch!: ElementRef;
  subscriptions: Subscription[] = [];

  constructor(private firestore: Firestore, private modalService: NgbModal) {
    this.categoriesCollection = collection(firestore, 'categories');
    this.waitHoldCollection = collection(firestore, 'wait-holds');
    let unfilteredCategories$ = (collectionData(this.categoriesCollection, { idField: "id" }) as Observable<Category[]>);
    const whQuery = query(this.waitHoldCollection, where("status", "in", ["Waiting", "Holding"]));
    let waitHold = (collectionData(whQuery) as Observable<WaitHold[]>);
    this.category$ = combineLatest([unfilteredCategories$, this.searchTerm$, waitHold]).pipe(
      map(([categories, term, waitHolds]) => {
        let categoriesWithCounts = categories.map(category => <CategoryWithCounts>{id: category.id, holding: 0, waiting: 0})
        for (let waitHold of waitHolds) {
          let category = categoriesWithCounts.find(category => category.id == waitHold.category)
          if (waitHold.status == "Holding") {
            category.holding++;
          }
          if (waitHold.status == "Waiting") {
            category.waiting++;
          }
        }
        return categoriesWithCounts.filter(category => category.id.toLowerCase().includes(term.toLowerCase()))
      })
    );
    
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  createCategory() {
    setDoc(doc(this.categoriesCollection, this.newCategoryName), <Category>{ id: this.newCategoryName })
      .then(() => this.newCategoryName = "");
  }

  deleteCategory(category: Category, deleteCategoryConfirm: any) {
    this.modalService.open(deleteCategoryConfirm).result.then(() => {
      // delete category
      var categoryReference = doc<DocumentData>(this.categoriesCollection, category.id);
      deleteDoc(categoryReference);
      // cancel holds for category
      const whQuery = query(this.waitHoldCollection, where("category", "==", category.id));
      this.subscriptions.push((collectionData(whQuery, { idField: "id" }) as Observable<WaitHold[]>).pipe(first()).subscribe(whArr => {
        for (var wh of whArr) {
          wh.status = 'Category Removed';
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
