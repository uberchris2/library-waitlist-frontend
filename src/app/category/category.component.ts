import { Component } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference, doc, DocumentData, query, where, setDoc, docData } from '@angular/fire/firestore';
import { EMPTY, Observable, first, map } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Category } from '../category';
import { RxHelpers } from '../rx-helpers';

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

  constructor(private firestore: Firestore, private modalService: NgbModal, private route: ActivatedRoute) {
    this.waitHoldCollection = collection(firestore, 'wait-holds');
    this.categoriesCollection = collection(firestore, 'categories');
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
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
    });
  }

  startHold(waitHold: WaitHold) {
    waitHold.status = "Holding";
    this.updateHold(waitHold, -1, 1);
  }

  cancelWaitHold(waitHold: WaitHold) {
    const wasHold = waitHold.status == "Holding";
    waitHold.status = "Cancelled";
    this.updateHold(waitHold, wasHold ? 0 : -1, wasHold ? -1 : 0);
  }

  demoteHold(waitHold: WaitHold) {
    waitHold.status = "Waiting";
    waitHold.created = new Date();
    this.updateHold(waitHold, 1, -1);
  }

  pickupHold(waitHold: WaitHold) {
    waitHold.status = "Completed";
    this.updateHold(waitHold, 0, -1);
  }

  private updateHold(waitHold: WaitHold, waitIncrement: number, holdIncrement: number) {
    const waitHoldReference = doc<DocumentData>(this.waitHoldCollection, waitHold.id);
    waitHold.updated = new Date();
    setDoc(waitHoldReference, waitHold).then(() => {
      const categoryReference = doc<DocumentData>(this.categoriesCollection, waitHold.category);
      docData(categoryReference).pipe(first()).subscribe(cat => {
        var updatedCategory = cat as Category;
        updatedCategory.holding = updatedCategory.holding + holdIncrement;
        updatedCategory.waiting = updatedCategory.waiting + waitIncrement;
        setDoc(categoryReference, updatedCategory);
      });
    });


  }
}
