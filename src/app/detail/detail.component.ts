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
  entity: Entity;

  constructor(
    private route: ActivatedRoute,
    private connecApiService: ConnecApiService
  ) { }

  ngOnInit() {
    this.route.params.switchMap((params: Params) => this.connecApiService.fetchEntity(params['collection'], params['id']))
      .subscribe(entity => this.entity = entity);
  }
}
