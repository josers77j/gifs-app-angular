import {  AfterViewInit, Component, computed, ElementRef, Inject, inject, signal, viewChild } from '@angular/core';
import { GifListComponent } from '../../components/gif-list/gif-list.component';
import { GifsService } from '../../services/gifs.service';
import { ScrollStateService } from 'src/app/shared/services/scroll-state.service';


@Component({
  selector: 'app-trending-page',
  // imports: [GifListComponent],
  templateUrl: './trending-page.component.html',
})
export default class TrendingPageComponent implements AfterViewInit{

  gifService = inject(GifsService);
  scrollStateService = inject(ScrollStateService);
scrollDivRef = viewChild<ElementRef<HTMLDivElement>>('groupDiv');

ngAfterViewInit(): void {
  const scrollDiv = this.scrollDivRef()?.nativeElement;
  if(!scrollDiv) return;

  scrollDiv.scrollTop = this.scrollStateService.getTrendingScrollState();
}
  onScroll(event:Event){
    const scrollDiv = this.scrollDivRef()?.nativeElement;
    if(!scrollDiv) return;

    const scrollTop = scrollDiv.scrollTop;
    const clientHeight = scrollDiv.clientHeight;
    const scrollHeight = scrollDiv.scrollHeight;

    const isAtBottom = scrollTop + clientHeight + 300 >= scrollHeight;

    this.scrollStateService.setTrendingScrollState(scrollTop);
    const topState = this.scrollStateService.getTrendingScrollState();
    console.log({topState});
    if (isAtBottom) {
      this.gifService.loadTrendingGifs();
    }
  /*   console.log({ scrollTop, clientHeight, scrollHeight});
console.log({isAtBottom}); */
  }
 }
