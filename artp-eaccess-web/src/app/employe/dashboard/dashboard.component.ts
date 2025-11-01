import { Component, OnInit } from '@angular/core';
import { EmployeService } from '../services/employe.service';

interface DashboardSummary {
  todayVisits: number;
  confirmed: number;
  pending: number;
  notifications: number;
}

@Component({
  selector: 'app-employe-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary = { todayVisits: 0, confirmed: 0, pending: 0, notifications: 0 };
  loading = true;

  constructor(private service: EmployeService) {}

  ngOnInit() {
    this.service.getDashboardSummary().subscribe(s => {
      this.summary = s;
      this.loading = false;
    });
  }

  
}
