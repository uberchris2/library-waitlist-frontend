import { Component } from '@angular/core';
import { Category } from '../category';
import { Firestore, collectionData, collection, addDoc, CollectionReference, docData, setDoc, doc, DocumentData } from '@angular/fire/firestore';
import { Observable, OperatorFunction, debounceTime, distinctUntilChanged, first, map } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

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

  names = [
    'Jason Moma',
    'Chris Evans',
    'George Clooney'
  ];

  category$: Observable<Category[]>;
  categoriesCollection: CollectionReference;
  waitHoldsCollection: CollectionReference;

  constructor(private firestore: Firestore, private modalService: NgbModal, private router: Router, private route: ActivatedRoute) {
    this.categoriesCollection = collection(firestore, 'categories');
    this.waitHoldsCollection = collection(firestore, 'wait-holds');
    this.category$ = collectionData(this.categoriesCollection, { idField: 'id' }) as Observable<Category[]>;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      var categoryIdParam = params.get('categoryId');
      if (categoryIdParam != null) {
        this.waitHold.category = categoryIdParam;
      }
    });
  }

  createWaitHold() {
    addDoc(this.waitHoldsCollection, this.waitHold).then(() => {
      const categoryReference = doc<DocumentData>(this.categoriesCollection, this.waitHold.category);
      docData(categoryReference).pipe(first()).subscribe(cat => {
        var updatedCategory = cat as Category;
        updatedCategory.waiting = updatedCategory.waiting + 1;
        setDoc(categoryReference, updatedCategory).then(() => {
          this.router.navigate(['category', this.waitHold.category])
        });
      });
    });
  }

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1 ? [] : this.names.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );
}
