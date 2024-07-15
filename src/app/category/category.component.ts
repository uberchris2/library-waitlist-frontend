import { Component } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference, query, where } from '@angular/fire/firestore';
import { EMPTY, Observable, Subscription, map } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RxHelpers } from '../rx-helpers';
import { DateHelpers } from '../date-helpers';
import { HoldHelpers } from '../hold-helpers';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {
  waitHold$: Observable<WaitHold[]> = EMPTY;
  waitHoldCollection: CollectionReference;
  categoriesCollection: CollectionReference;
  categoryId = "";
  today = new Date();
  subscriptions: Subscription[] = [];

  constructor(private firestore: Firestore, private modalService: NgbModal, private route: ActivatedRoute) {
    this.waitHoldCollection = collection(firestore, 'wait-holds');
    this.categoriesCollection = collection(firestore, 'categories');
  }

  ngOnInit(): void {
    this.subscriptions.push(this.route.paramMap.subscribe((params: ParamMap) => {
      this.categoryId = String(params.get('categoryId'));
      const whQuery = query(this.waitHoldCollection,
        where("category", "==", this.categoryId),
        where("status", "in", ["Waiting", "Holding"]));
      this.waitHold$ = (collectionData(whQuery, { idField: "id" }) as Observable<WaitHold[]>).pipe(
        RxHelpers.fixWaitHoldDates,
        map(wha => wha.sort((wh1, wh2) => {
          if (wh1.status != wh2.status) {
            return wh1.status == 'Waiting' ? 1 : -1;
          }
          if (wh1.created != wh2.created) {
            return wh1.created > wh2.created ? 1 : -1;
          }
          return 0;
        }))
      );
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  startHold(waitHold: WaitHold) {
    waitHold.status = "Holding";
    waitHold.holdExpiration = DateHelpers.getExpirationDate();
    HoldHelpers.updateWaitHold(this.waitHoldCollection, this.categoriesCollection, waitHold);
  }

  cancelWaitHold(waitHold: WaitHold) {
    const wasHold = waitHold.status == "Holding";
    waitHold.status = "Cancelled";
    HoldHelpers.updateWaitHold(this.waitHoldCollection, this.categoriesCollection, waitHold);
  }

  demoteHold(waitHold: WaitHold) {
    const wasHold = waitHold.status == "Holding";
    waitHold.status = "Waiting";
    waitHold.created = new Date();
    waitHold.holdExpiration = null;
    HoldHelpers.updateWaitHold(this.waitHoldCollection, this.categoriesCollection, waitHold);
  }

  pickupHold(waitHold: WaitHold) {
    waitHold.status = "Completed";
    HoldHelpers.updateWaitHold(this.waitHoldCollection, this.categoriesCollection, waitHold);
  }
}
