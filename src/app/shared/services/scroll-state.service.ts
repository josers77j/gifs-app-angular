import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ScrollStateService {
  private trendingScrollState = signal(0);

  setTrendingScrollState(scrollState: number): void {
    this.trendingScrollState.set(scrollState);
  }

  getTrendingScrollState(): number {
    return this.trendingScrollState();
  }
}
