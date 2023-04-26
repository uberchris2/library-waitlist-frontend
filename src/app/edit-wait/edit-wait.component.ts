import { Component } from '@angular/core';
import { Category } from '../category';
import { Firestore, collectionData, collection, addDoc, CollectionReference, doc, DocumentData, docData, DocumentReference, setDoc } from '@angular/fire/firestore';
import { Observable, OperatorFunction, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-edit-wait',
  templateUrl: './edit-wait.component.html',
  styleUrls: ['./edit-wait.component.css']
})
export class EditWaitComponent {
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
      var waitHoldId = String(params.get('waitHoldId'));
      docData(doc<DocumentData>(this.waitHoldsCollection, waitHoldId)).subscribe(wh => this.waitHold = wh as WaitHold);
    });
  }

  updateWaitHold() {
    setDoc(doc<DocumentData>(this.waitHoldsCollection, this.waitHold.id), this.waitHold).then(() => {
      this.router.navigate(['category', this.waitHold.category])
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
