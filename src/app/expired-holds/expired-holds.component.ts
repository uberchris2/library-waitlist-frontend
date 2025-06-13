import { Component } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference, query, where } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute, Router } from '@angular/router';
import { RxHelpers } from '../rx-helpers';
import { HoldHelpers } from '../hold-helpers';
import { ClipboardModule } from 'ngx-clipboard';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-expired-holds',
    templateUrl: './expired-holds.component.html',
    styleUrls: ['./expired-holds.component.css'],
    standalone: true,
    imports: [NgIf, NgFor, ClipboardModule, NgbPopover, AsyncPipe, DatePipe]
})
export class ExpiredHoldsComponent {
  expiredHold$: Observable<WaitHold[]>;
  waitHoldCollection: CollectionReference;
  categoriesCollection: CollectionReference;
  waitlistLengthByCategory$: Observable<any>;

  constructor(private firestore: Firestore, private modalService: NgbModal, private route: ActivatedRoute, private router: Router) {
    this.waitHoldCollection = collection(firestore, 'wait-holds');
    this.categoriesCollection = collection(firestore, 'categories');
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

  cancelHold(waitHold: WaitHold, routeAfterward: boolean) {
    waitHold.status = "Cancelled";
    HoldHelpers.updateWaitHold(this.waitHoldCollection, this.categoriesCollection, waitHold).then(() => {
      if (routeAfterward) {
        this.router.navigate(['category', waitHold.category]);
      }
    })
  }

  demoteHold(waitHold: WaitHold) {
    waitHold.status = "Waiting";
    waitHold.created = new Date();
    waitHold.holdExpiration = null;
    HoldHelpers.updateWaitHold(this.waitHoldCollection, this.categoriesCollection, waitHold);
  }
}

