import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';

import { ConnecApiService } from '../services/connec-api.service';

import { Observable } from 'rxjs/Observable';
import { Entity } from '../models/entity';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DetailComponent implements OnInit {
  entity$: Observable<Entity>;
  entity: Entity;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private connecApiService: ConnecApiService
  ) { }

  ngOnInit() {
    this.entity$ = this.route.params.switchMap((params: Params) => this.connecApiService.fetchEntity(params['collection'], params['id']));
    this.entity$.subscribe(entity => this.entity = entity);
  }

  navigateToCollection(collection: string) {
    this.router.navigate(['/visualiser', collection]);
  }
}
