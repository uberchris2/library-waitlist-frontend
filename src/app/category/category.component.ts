import { Component } from '@angular/core';
import { Firestore, collectionData, collection, addDoc, CollectionReference, DocumentReference, doc, DocumentData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {
  waitHold$: Observable<WaitHold[]>;
  waitHoldCollection: CollectionReference;

  constructor(private firestore: Firestore, private modalService: NgbModal) {
    this.waitHoldCollection = collection(firestore, 'wait-holds');
    this.waitHold$ = collectionData(this.waitHoldCollection, { idField: "id" }) as Observable<WaitHold[]>;
  }
}
