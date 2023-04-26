import { Component } from '@angular/core';
import { Firestore, collectionData, collection, addDoc, CollectionReference, DocumentReference, doc, DocumentData, query, where } from '@angular/fire/firestore';
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
      const whQuery = query(this.waitHoldCollection, where("category", "==", this.categoryName))
      this.waitHold$ = collectionData(whQuery, { idField: "id" }) as Observable<WaitHold[]>;
    });
  }
}
