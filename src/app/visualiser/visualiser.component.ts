import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';

import {DataSource} from '@angular/cdk/collections';

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
  displayedColumns = ['id', 'code', 'name'];
  dataSource: VisualiserDataSource | null;

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit() {
    this.dataSource = new VisualiserDataSource(this.store);
  }
}

export class VisualiserDataSource extends DataSource<any> {
  constructor(private store: Store<fromRoot.State>) {
    super();
  }

  public connect(): Observable<Entity[]> {
    return this.store.select('entities');
  }

  public disconnect() {}
}
