import { Component } from '@angular/core';
import { Category } from '../category';
import { Firestore, collectionData, collection, addDoc, CollectionReference, doc, DocumentData, docData, DocumentReference, setDoc } from '@angular/fire/firestore';
import { Observable, OperatorFunction, Subscription, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { RxHelpers } from '../rx-helpers';

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

  category$: Observable<Category[]>;
  categoriesCollection: CollectionReference;
  waitHoldsCollection: CollectionReference;
  subscriptions: Subscription[] = [];

  constructor(private firestore: Firestore, private modalService: NgbModal, private router: Router, private route: ActivatedRoute) {
    this.categoriesCollection = collection(firestore, 'categories');
    this.waitHoldsCollection = collection(firestore, 'wait-holds');
    this.category$ = collectionData(this.categoriesCollection, { idField: 'id' }) as Observable<Category[]>;
  }

  ngOnInit(): void {
    this.subscriptions.push(this.route.paramMap.subscribe((params: ParamMap) => {
      var waitHoldId = String(params.get('waitHoldId'));
      this.subscriptions.push(docData(doc<DocumentData>(this.waitHoldsCollection, waitHoldId))
        .pipe(RxHelpers.fixWaitHoldDate)
        .subscribe(wh => this.waitHold = wh as WaitHold));
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  updateWaitHold() {
    setDoc(doc<DocumentData>(this.waitHoldsCollection, this.waitHold.id), this.waitHold).then(() => {
      this.router.navigate(['category', this.waitHold.category])
    });
  }

  updateDate(dateString: string) {
    // https://stackoverflow.com/questions/7556591/is-the-javascript-date-object-always-one-day-off
    this.waitHold.holdExpiration = new Date(dateString.replace(/-/g, '\/'));
  }
}
