// src/app/employe/history/history.component.ts
import { Component, OnInit } from '@angular/core';
import { EmployeService, Visit } from '../services/employe.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  visits: Visit[] = [];
  loading = true;

  constructor(private service: EmployeService) {}

  ngOnInit() {
    this.service.listHistory().subscribe({
      next: v => { this.visits = v; this.loading = false; },
      error: _ => this.loading = false,
    });
  }
}
