import { Component } from '@angular/core';
import { Category } from '../category';
import { Firestore, collectionData, collection, addDoc, CollectionReference, doc, DocumentData, docData, DocumentReference, setDoc } from '@angular/fire/firestore';
import { Observable, OperatorFunction, Subscription, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { RxHelpers } from '../rx-helpers';
import { NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-edit-wait',
    templateUrl: './edit-wait.component.html',
    styleUrls: ['./edit-wait.component.css'],
    standalone: true,
    imports: [FormsModule, NgIf, RouterLink, DatePipe]
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
      this.subscriptions.push(docData(doc(this.waitHoldsCollection, waitHoldId), { idField: 'id' })
        .pipe(RxHelpers.fixWaitHoldDate)
        .subscribe(wh => this.waitHold = wh as WaitHold));
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  updateWaitHold() {
    setDoc(doc(this.waitHoldsCollection, this.waitHold.id), this.waitHold).then(() => {
      this.router.navigate(['category', this.waitHold.category])
    });
  }

  updateDate(dateString: string) {
    // https://stackoverflow.com/questions/7556591/is-the-javascript-date-object-always-one-day-off
    this.waitHold.holdExpiration = new Date(dateString.replace(/-/g, '\/'));
  }
}
