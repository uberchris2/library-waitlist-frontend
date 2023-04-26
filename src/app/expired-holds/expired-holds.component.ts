import { Component } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference, query, where } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute } from '@angular/router';
import { RxHelpers } from '../rx-helpers';

@Component({
  selector: 'app-expired-holds',
  templateUrl: './expired-holds.component.html',
  styleUrls: ['./expired-holds.component.css']
})
export class ExpiredHoldsComponent {
  expiredHold$: Observable<WaitHold[]>;
  waitHoldCollection: CollectionReference;
  waitlistLengthByCategory$: Observable<any>;

  constructor(private firestore: Firestore, private modalService: NgbModal, private route: ActivatedRoute) {
    this.waitHoldCollection = collection(firestore, 'wait-holds');
    const today = new Date();
    const whQuery = query(this.waitHoldCollection, where("status", "in", ["Waiting", "Holding"]));
    var waitHolds = (collectionData(whQuery, { idField: "id" }) as Observable<WaitHold[]>);
    this.expiredHold$ = waitHolds.pipe(
      RxHelpers.fixWaitHoldDates,
      map(whArr => whArr.filter(wh => wh.status == 'Holding')),
      map(whArr => whArr.filter(wh => wh.holdExpiration && wh.holdExpiration < today))
      // todo: sort this table
    );
    this.waitlistLengthByCategory$ = waitHolds.pipe(
      map(whArr => whArr.filter(wh => wh.status == "Waiting")),
      map(whArr => whArr.reduce((prev: any, curr) => {
        var category = curr.category;
        if (!prev.hasOwnProperty(category)) {
          prev[category] = 0;
        }
        prev[category]++;
        return prev;
      }, {}))
    );
  }
}

