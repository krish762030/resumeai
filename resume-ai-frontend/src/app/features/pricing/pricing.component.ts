import { Component } from '@angular/core';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  badge: string;
}

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html'
})
export class PricingComponent {
  readonly plans: PricingPlan[] = [
    {
      name: 'Free',
      price: 'Rs0',
      description: 'One resume analysis for first-time users.',
      features: ['1 resume upload', 'ATS score', 'Basic suggestions'],
      badge: ''
    },
    {
      name: 'Pro',
      price: 'Rs99',
      description: 'Detailed resume improvement suggestions and premium builder access.',
      features: ['Detailed summary rewrite', 'Improved bullet points', 'Keyword guidance'],
      badge: 'Most Popular'
    },
    {
      name: 'Premium',
      price: 'Rs199',
      description: 'Resume analysis plus role matching.',
      features: ['Everything in Pro', 'Job matches', 'Missing skills tracking'],
      badge: ''
    }
  ];

  selectedPlan = this.plans[1];
}
