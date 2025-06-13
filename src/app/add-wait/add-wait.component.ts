import { Component, ElementRef, ViewChild } from '@angular/core';
import { Category } from '../category';
import { Firestore, collectionData, collection, addDoc, CollectionReference, docData, setDoc, doc, DocumentData, query, where, limit } from '@angular/fire/firestore';
import { Observable, OperatorFunction, Subscription, catchError, debounceTime, distinctUntilChanged, first, map, of, switchMap, BehaviorSubject, combineLatest } from 'rxjs';
import { NgbModal, NgbTypeaheadSelectItemEvent, NgbTypeahead, NgbHighlight } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { Member } from '../member';
import { NgFor, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';

@Component({
    selector: 'app-add-wait',
    templateUrl: './add-wait.component.html',
    styleUrls: ['./add-wait.component.css'],
    standalone: true,
    imports: [FormsModule, NgFor, NgbTypeahead, RouterLink, NgbHighlight, AsyncPipe]
})
export class AddWaitComponent {
  @ViewChild('memberSearch', { static: true }) memberSearch!: ElementRef;
  @ViewChild('categorySearch', { static: true }) categorySearch!: ElementRef;
  public waitHold: WaitHold = {
    category: "",
    created: new Date(),
    updated: new Date(),
    email: "",
    id: "",
    status: "Waiting",
    holdExpiration: null,
    name: "",
    tool: ""
  };

  member$: Observable<Member[]>;
  category$: Observable<Category[]>;
  categoriesCollection: CollectionReference;
  membersCollection: CollectionReference;
  waitHoldCollection: CollectionReference;
  memberSearchTerm$ = new BehaviorSubject<string>('');
  categorySearchTerm$ = new BehaviorSubject<string>('');
  subscriptions: Subscription[] = [];

  private firestore = inject(Firestore);
  private modalService = inject(NgbModal);

  constructor(private router: Router, private route: ActivatedRoute) {
    this.categoriesCollection = collection(this.firestore, 'categories');
    this.membersCollection = collection(this.firestore, 'members');
    this.waitHoldCollection = collection(this.firestore, 'wait-holds');

    const categoriesQuery = query(this.categoriesCollection);
    this.category$ = collectionData(categoriesQuery, { idField: 'id' }) as Observable<Category[]>;
  }

  ngOnInit(): void {
    this.subscriptions.push(this.route.paramMap.subscribe((params: ParamMap) => {
      var categoryIdParam = params.get('categoryId');
      if (categoryIdParam != null) {
        this.waitHold.category = categoryIdParam;
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  createWaitHold() {
    addDoc(this.waitHoldCollection, this.waitHold).then(() => {
      this.router.navigate(['category', this.waitHold.category])
    });
  }

  memberSelected(event: NgbTypeaheadSelectItemEvent) {
    this.waitHold.name = event.item.name;
    this.waitHold.email = event.item.email;
  }

  memberNameEntered(event: any) {
    this.waitHold.name = event.target.value;
  }

  search: OperatorFunction<string, readonly Member[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((term) => {
        const searchQuery = query(this.membersCollection,
          where('name', '>=', this.capitalizeFirstLetter(term)),
          where('name', '<=', this.capitalizeFirstLetter(term) + '\uf8ff'),
          limit(10)
        );
        return (collectionData(searchQuery) as Observable<Member[]>);
      }));

  formatter = (x: { name: string }) => x.name;

  private capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  onMemberSearch(term: any) {
    this.memberSearchTerm$.next(term.target.value);
  }

  onCategorySearch(term: any) {
    this.categorySearchTerm$.next(term.target.value);
  }

  clearMemberSearch() {
    this.memberSearch.nativeElement.value = '';
    this.memberSearchTerm$.next('');
  }

  clearCategorySearch() {
    this.categorySearch.nativeElement.value = '';
    this.categorySearchTerm$.next('');
  }

  searchMembers(term: string): Observable<Member[]> {
    if (term.length < 2) return new Observable<Member[]>();
    const searchQuery = query(this.membersCollection, where("name", ">=", term), where("name", "<=", term + '\uf8ff'), limit(10));
    return (collectionData(searchQuery) as Observable<Member[]>);
  }

  addWaitHold(member: Member, category: Category, addWaitConfirm: any) {
    this.modalService.open(addWaitConfirm).result.then(() => {
      const waitHold: WaitHold = {
        id: '', // This will be set by Firestore
        category: category.id,
        created: new Date(),
        updated: new Date(),
        status: "Waiting",
        name: member.name,
        email: member.email,
        tool: category.id,
        holdExpiration: null
      };
      addDoc(this.waitHoldCollection, waitHold);
    });
  }
}
