import { Component, signal } from '@angular/core';

interface RecommendedCar {
  id: number;
  make: string;
  model: string;
  varient: string;
  price: number;
  fuelType: string;
  seats: number;
  mileageMpg: number;
  safetyRatings: number;
  horsePower: number;
  useCase: string;
  reviewSummary: string;
  matchScore: number;
}

@Component({
  selector: 'app-result',
  standalone: true,
  templateUrl: './result.component.html'
})
export class ResultComponent {
  readonly results = signal<RecommendedCar[]>([]);

  constructor() {
    const state = history.state as { recommendations?: RecommendedCar[] };
    this.results.set(state.recommendations ?? []);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  }

  getBadgeClass(score: number): string {
    if (score > 80) {
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    }

    if (score >= 60) {
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    }

    return 'bg-slate-100 text-slate-700 border border-slate-200';
  }

  safetyStars(rating: number): string {
    const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
    return `${'★'.repeat(safeRating)}${'☆'.repeat(5 - safeRating)}`;
  }

  startOver(): void {
    window.location.assign('/');
  }
}
