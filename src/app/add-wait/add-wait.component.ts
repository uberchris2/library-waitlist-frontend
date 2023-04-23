import { Component } from '@angular/core';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction, debounceTime, distinctUntilChanged, map } from 'rxjs';

@Component({
  selector: 'app-add-wait',
  templateUrl: './add-wait.component.html',
  styleUrls: ['./add-wait.component.css']
})
export class AddWaitComponent {
  public model: any;
  names = [
    'Jason Moma',
    'Chris Evans',
    'George Clooney'
  ];

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1 ? [] : this.names.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );
}
