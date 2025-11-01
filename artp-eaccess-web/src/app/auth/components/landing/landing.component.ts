// landing.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Smooth scrolling for navigation links
    this.initSmoothScrolling();
    
    // Add scroll effect to header
    this.initScrollEffect();
  }

  goToLogin(): void {
    // Navigate to login page
    this.router.navigate(['/auth/login']);
  }

  private initSmoothScrolling(): void {
    // Add smooth scrolling behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href') as string);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  private initScrollEffect(): void {
    // Add scroll effect to header
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.header') as HTMLElement;
      if (header) {
        if (window.scrollY > 100) {
          header.style.background = 'rgba(255, 255, 255, 0.15)';
          header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
          header.style.background = 'rgba(255, 255, 255, 0.1)';
          header.style.boxShadow = 'none';
        }
      }
    });
  }

  // Method for demo button (optional)
  showDemo(): void {
    // You can implement a demo modal or navigate to a demo page
    console.log('Show demo clicked');
  }

  // Method for scrolling to specific sections
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}