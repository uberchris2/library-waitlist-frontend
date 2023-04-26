import { Component } from '@angular/core';
import { Firestore, collectionData, collection, addDoc, CollectionReference, DocumentReference, doc, DocumentData, query, where, setDoc } from '@angular/fire/firestore';
import { EMPTY, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {
  waitHold$: Observable<WaitHold[]> = EMPTY;
  waitHoldCollection: CollectionReference;
  categoryName = "";

  constructor(private firestore: Firestore, private modalService: NgbModal, private route: ActivatedRoute) {
    this.waitHoldCollection = collection(firestore, 'wait-holds');
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.categoryName = String(params.get('categoryName'));
      const whQuery = query(this.waitHoldCollection,
        where("category", "==", this.categoryName),
        where("status", "in", ["Waiting", "Holding"]))
      this.waitHold$ = collectionData(whQuery, { idField: "id" }) as Observable<WaitHold[]>;
    });
  }

  startHold(waitHold: WaitHold) {
    waitHold.status = "Holding";
    this.updateHold(waitHold);
  }

  cancelHold(waitHold: WaitHold) {
    waitHold.status = "Cancelled";
    this.updateHold(waitHold);
  }

  demoteHold(waitHold: WaitHold) {
    waitHold.status = "Waiting";
    waitHold.created = new Date();
    this.updateHold(waitHold);
  }

  pickupHold(waitHold: WaitHold) {
    waitHold.status = "Completed";
    this.updateHold(waitHold);
  }

  private updateHold(waitHold: WaitHold) {
    var waitHoldReference = doc<DocumentData>(this.waitHoldCollection, waitHold.id);
    waitHold.updated = new Date();
    setDoc(waitHoldReference, waitHold);
  }
}
