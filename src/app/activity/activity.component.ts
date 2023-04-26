import { Component } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference, query, orderBy, limit, DocumentData } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute } from '@angular/router';
import { RxHelpers } from '../rx-helpers';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent {
  waitHoldCollection: CollectionReference;
  waitHold$: Observable<WaitHold[]>;

  constructor(private firestore: Firestore, private modalService: NgbModal, private route: ActivatedRoute) {
    this.waitHoldCollection = collection(firestore, 'wait-holds');

    const whQuery = query(this.waitHoldCollection,
      orderBy('updated', 'desc'),
      limit(50));
    this.waitHold$ = collectionData(whQuery).pipe(RxHelpers.fixWaitHoldDates);
  }

}
