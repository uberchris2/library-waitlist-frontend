import { Component } from '@angular/core';
import { Category } from '../category';
import { Firestore, collectionData, collection, addDoc, CollectionReference } from '@angular/fire/firestore';
import { Observable, OperatorFunction, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-wait',
  templateUrl: './add-wait.component.html',
  styleUrls: ['./add-wait.component.css']
})
export class AddWaitComponent {
  public waitHold: WaitHold;

  private resetWaitHold = {
    category: "",
    created: new Date(),
    email: "",
    id: "",
    status: "Waiting",
    holdExpiration: null,
    name: "",
    tool: ""
  };

  names = [
    'Jason Moma',
    'Chris Evans',
    'George Clooney'
  ];

  category$: Observable<Category[]>;
  categoriesCollection: CollectionReference;
  waitHoldsCollection: CollectionReference;

  constructor(private firestore: Firestore, private modalService: NgbModal, private router: Router) {
    this.waitHold = this.resetWaitHold;
    this.categoriesCollection = collection(firestore, 'categories');
    this.waitHoldsCollection = collection(firestore, 'wait-holds');
    this.category$ = collectionData(this.categoriesCollection, { idField: "id" }) as Observable<Category[]>;
  }

  createWaitHold() {
    addDoc(this.waitHoldsCollection, this.waitHold).then(() => {
      this.waitHold = this.resetWaitHold;
      this.router.navigateByUrl('/category')
    });
  }

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1 ? [] : this.names.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );
}
