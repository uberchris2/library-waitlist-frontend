import { Component } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference, query, orderBy, limit } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute } from '@angular/router';

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
    this.waitHold$ = collectionData(whQuery).pipe(
      map(docDataArr => docDataArr.map(docData => {
        docData['updated'] = docData['updated']?.toDate();
        docData['created'] = docData['created']?.toDate();
        docData['holdExpiration'] = docData['holdExpiration']?.toDate();
        return docData as WaitHold;
      })));
  }

}
