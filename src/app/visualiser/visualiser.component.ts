import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../reducers/index';
import { Entity } from '../models/entity';

@Component({
  selector: 'connec-visualiser',
  templateUrl: './visualiser.component.html',
  styleUrls: ['./visualiser.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class VisualiserComponent implements OnInit {
  entities$: Observable<Entity[]>;

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit() {
    this.entities$ = this.store.select('entities');
  }

}
