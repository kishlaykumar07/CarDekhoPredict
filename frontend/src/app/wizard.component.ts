import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { API_CONFIG } from './api.config';

interface RecommendationRequest {
  budget: number;
  useCase: string;
  seats: number;
  fuelType: string;
  priority: string;
}

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

type UseCaseValue = 'city' | 'family' | 'adventure' | 'highway';
type FuelValue = 'Petrol' | 'Diesel' | 'Hybrid' | 'EV' | 'No preference';
type PriorityValue = 'safety' | 'economy' | 'performance' | 'value';

interface Option<TValue extends string | number> {
  label: string;
  value: TValue;
}

@Component({
  selector: 'app-wizard',
  standalone: true,
  templateUrl: './wizard.component.html'
})
export class WizardComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly totalSteps = 5;
  readonly minBudget = 400000;
  readonly maxBudget = 5000000;
  readonly budgetStep = 200000;

  readonly step = signal(1);
  readonly budget = signal(1200000);
  readonly useCase = signal<UseCaseValue | null>(null);
  readonly seats = signal<number | null>(null);
  readonly fuelType = signal<FuelValue>('No preference');
  readonly priority = signal<PriorityValue>('value');
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly useCaseOptions: Option<UseCaseValue>[] = [
    { label: 'City Commute', value: 'city' },
    { label: 'Family Hauler', value: 'family' },
    { label: 'Weekend Adventure', value: 'adventure' },
    { label: 'Long Highway', value: 'highway' }
  ];

  readonly seatsOptions: Option<number>[] = [
    { label: '5 seats (Hatchback / Sedan / SUV)', value: 5 },
    { label: '7 seats (MPV / Large SUV)', value: 7 }
  ];

  readonly fuelOptions: Option<FuelValue>[] = [
    { label: 'Petrol', value: 'Petrol' },
    { label: 'Diesel', value: 'Diesel' },
    { label: 'Hybrid', value: 'Hybrid' },
    { label: 'EV', value: 'EV' },
    { label: 'No Preference', value: 'No preference' }
  ];

  readonly priorityOptions: Option<PriorityValue>[] = [
    { label: 'Safety', value: 'safety' },
    { label: 'Fuel Economy', value: 'economy' },
    { label: 'Performance', value: 'performance' },
    { label: 'Value for Money', value: 'value' }
  ];

  readonly progressPercent = computed(() =>
    Math.round((this.step() / this.totalSteps) * 100)
  );

  readonly canGoNext = computed(() => {
    switch (this.step()) {
      case 1:
        return true;
      case 2:
        return this.useCase() !== null;
      case 3:
        return this.seats() !== null;
      case 4:
        return this.fuelType().length > 0;
      case 5:
        return this.priority().length > 0;
      default:
        return false;
    }
  });

  formatBudget(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }

  onBudgetInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.budget.set(value);
  }

  goNext(): void {
    if (!this.canGoNext() || this.step() >= this.totalSteps) {
      return;
    }

    this.step.update(current => current + 1);
  }

  goBack(): void {
    if (this.step() <= 1) {
      return;
    }

    this.step.update(current => current - 1);
  }

  async submit(): Promise<void> {
    if (!this.canGoNext() || this.isSubmitting()) {
      return;
    }

    const selectedUseCase = this.useCase();
    const selectedSeats = this.seats();

    if (!selectedUseCase || selectedSeats === null) {
      this.errorMessage.set('Please complete all steps before submitting.');
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const requestBody: RecommendationRequest = {
      budget: this.budget(),
      useCase: selectedUseCase,
      seats: selectedSeats,
      fuelType: this.fuelType(),
      priority: this.priority()
    };

    try {
      const recommendations = await this.http
        .post<RecommendedCar[]>(API_CONFIG.endpoints.recommendations, requestBody)
        .toPromise();

      await this.router.navigate(['/results'], {
        state: {
          recommendations: recommendations ?? [],
          request: requestBody
        }
      });
    } catch {
      this.errorMessage.set('Unable to fetch recommendations. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
