import { Component } from '@angular/core';
import { Category } from '../category';
import { Firestore, collectionData, collection, addDoc, CollectionReference, docData, setDoc, doc, DocumentData, query, where, limit } from '@angular/fire/firestore';
import { Observable, OperatorFunction, Subscription, catchError, debounceTime, distinctUntilChanged, first, map, of, switchMap } from 'rxjs';
import { NgbModal, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Member } from '../member';

@Component({
  selector: 'app-add-wait',
  templateUrl: './add-wait.component.html',
  styleUrls: ['./add-wait.component.css']
})
export class AddWaitComponent {
  public waitHold: WaitHold = {
    category: "",
    created: new Date(),
    updated: new Date(),
    email: "",
    id: "",
    status: "Waiting",
    holdExpiration: null,
    name: "",
    tool: ""
  };

  category$: Observable<Category[]>;
  categoriesCollection: CollectionReference;
  waitHoldsCollection: CollectionReference;
  membersCollection: CollectionReference;
  subscriptions: Subscription[] = [];

  constructor(private firestore: Firestore, private modalService: NgbModal, private router: Router, private route: ActivatedRoute) {
    this.categoriesCollection = collection(firestore, 'categories');
    this.waitHoldsCollection = collection(firestore, 'wait-holds');
    this.membersCollection = collection(firestore, 'members');
    this.category$ = collectionData(this.categoriesCollection, { idField: 'id' }) as Observable<Category[]>;
  }

  ngOnInit(): void {
    this.subscriptions.push(this.route.paramMap.subscribe((params: ParamMap) => {
      var categoryIdParam = params.get('categoryId');
      if (categoryIdParam != null) {
        this.waitHold.category = categoryIdParam;
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  createWaitHold() {
    addDoc(this.waitHoldsCollection, this.waitHold).then(() => {
      const categoryReference = doc<DocumentData>(this.categoriesCollection, this.waitHold.category);
      this.subscriptions.push(docData(categoryReference).pipe(first()).subscribe(cat => {
        var updatedCategory = cat as Category;
        updatedCategory.waiting = updatedCategory.waiting + 1;
        setDoc(categoryReference, updatedCategory).then(() => {
          this.router.navigate(['category', this.waitHold.category])
        });
      }));
    });
  }

  memberSelected(event: NgbTypeaheadSelectItemEvent) {
    this.waitHold.name = event.item.name;
    this.waitHold.email = event.item.email;
  }

  memberNameEntered(event: any) {
    this.waitHold.name = event.target.value;
  }

  search: OperatorFunction<string, readonly Member[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((term) => {
        const searchQuery = query(this.membersCollection,
          where('name', '>=', term),
          where('name', '<=', term + '\uf8ff'),
          limit(10)
        );
        return (collectionData(searchQuery) as Observable<Member[]>);
      }));

  formatter = (x: { name: string }) => x.name;

}
