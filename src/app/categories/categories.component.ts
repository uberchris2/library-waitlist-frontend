import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Category } from '../category';
import { Firestore, collectionData, collection, CollectionReference, doc, DocumentData, setDoc, query, where, Query, DocumentReference } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription, combineLatest, first, map } from 'rxjs';
import { deleteDoc } from '@angular/fire/firestore';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { CategoryWithCounts } from '../category-with-counts';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Type } from '@angular/core';

const IMPORTS: Type<any>[] = [NgIf, NgFor, RouterLink, NgbPopover, FormsModule, AsyncPipe];

@Component({
    selector: 'app-categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.css'],
    standalone: true,
    imports: IMPORTS
})
export class CategoriesComponent {
  category$: Observable<CategoryWithCounts[]>;
  categoriesCollection: CollectionReference<Category, DocumentData>;
  waitHoldCollection: CollectionReference<WaitHold, DocumentData>;
  newCategoryName = "";
  searchTerm$ = new BehaviorSubject<string>('');
  @ViewChild('categorySearch', { static: true }) categorySearch!: ElementRef;
  subscriptions: Subscription[] = [];

  private firestore = inject(Firestore);
  private modalService = inject(NgbModal);

  constructor() {
    this.categoriesCollection = collection(this.firestore, 'categories') as CollectionReference<Category, DocumentData>;
    this.waitHoldCollection = collection(this.firestore, 'wait-holds') as CollectionReference<WaitHold, DocumentData>;
    
    // Create queries for both collections
    const categoriesQuery = query<Category, DocumentData>(this.categoriesCollection);
    const whQuery = query<WaitHold, DocumentData>(this.waitHoldCollection, where("status", "in", ["Waiting", "Holding"]));
    
    const unfilteredCategories$ = collectionData<Category>(categoriesQuery, { idField: 'id' });
    const waitHold$ = collectionData<WaitHold>(whQuery, { idField: 'id' });
    
    this.category$ = combineLatest([unfilteredCategories$, this.searchTerm$, waitHold$]).pipe(
      map(([categories, term, waitHolds]) => {
        const categoriesWithCounts = categories.map(category => ({
          id: category.id,
          holding: 0,
          waiting: 0
        }));
        
        waitHolds.forEach(waitHold => {
          const category = categoriesWithCounts.find(c => c.id === waitHold.category);
          if (category) {
            if (waitHold.status === "Holding") {
              category.holding++;
            }
            if (waitHold.status === "Waiting") {
              category.waiting++;
            }
          }
        });
        
        return categoriesWithCounts.filter(category => 
          category.id.toLowerCase().includes(term.toLowerCase())
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  createCategory() {
    setDoc(doc(this.categoriesCollection, this.newCategoryName), { id: this.newCategoryName })
      .then(() => this.newCategoryName = "");
  }

  deleteCategory(category: Category, deleteCategoryConfirm: any) {
    this.modalService.open(deleteCategoryConfirm).result.then(() => {
      const categoryReference = doc(this.categoriesCollection, category.id);
      deleteDoc(categoryReference);
      
      const whQuery = query<WaitHold, DocumentData>(
        this.waitHoldCollection, 
        where("category", "==", category.id)
      );
      
      this.subscriptions.push(
        collectionData<WaitHold>(whQuery, { idField: 'id' })
          .pipe(first())
          .subscribe(whArr => {
            whArr.forEach(wh => {
              const waitHoldReference = doc(this.waitHoldCollection, wh.id);
              setDoc(waitHoldReference, {
                ...wh,
                status: 'Category Removed',
                updated: new Date()
              });
            });
          })
      );
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
