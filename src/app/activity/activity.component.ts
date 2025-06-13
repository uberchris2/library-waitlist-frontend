import { Component } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference, query, orderBy, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute, Router } from '@angular/router';
import { RxHelpers } from '../rx-helpers';
import { HoldHelpers } from '../hold-helpers';
import { NgFor, NgIf, AsyncPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-activity',
    templateUrl: './activity.component.html',
    styleUrls: ['./activity.component.css'],
    standalone: true,
    imports: [NgFor, NgIf, NgbPopover, AsyncPipe, DatePipe]
})
export class ActivityComponent {
  waitHoldCollection: CollectionReference;
  categoriesCollection: CollectionReference;
  waitHold$: Observable<WaitHold[]>;

  constructor(private firestore: Firestore, private modalService: NgbModal, private route: ActivatedRoute, private router: Router) {
    this.waitHoldCollection = collection(firestore, 'wait-holds');
    this.categoriesCollection = collection(firestore, 'categories');

    const whQuery = query(this.waitHoldCollection,
      orderBy('updated', 'desc'),
      limit(50));
    this.waitHold$ = collectionData(whQuery).pipe(RxHelpers.fixWaitHoldDates);
  }

  revive(waitHold: WaitHold) {
    waitHold.status = "Waiting";
    waitHold.created = new Date();
    waitHold.holdExpiration = null;
    HoldHelpers.updateWaitHold(this.waitHoldCollection, this.categoriesCollection, waitHold);
    this.router.navigate(['category', waitHold.category]);
  }

}
