import {
    Component,
    ElementRef,
    Input,
    ViewChild,
    AfterViewInit,
    OnChanges,
    SimpleChanges,
    OnInit,
  EventEmitter,
   Output,
   OnDestroy,  NgZone, ChangeDetectorRef, DoCheck
} from "@angular/core";

import * as $ from 'jquery';
import {CanvasWhiteboardService} from '../../services/canvas-whiteboard.service'
import {MathJackService} from '../../services/math-jack.service'

@Component({
  selector: 'app-math-jack',
  templateUrl: './math-jack.component.html',
  styleUrls: ['./math-jack.component.scss']
})
export class MathJackComponent implements OnInit {

  @Input() content :string = '';
  constructor(public mathJack: MathJackService) { }
  mathJaxObject;

  ngOnChanges(changes: SimpleChanges) {
    // to render math equations again on content change
    if (changes['content']) {
      this.renderMath()
    }

  }

  ngOnInit() {
    this.loadMathConfig()
    this.renderMath();
  }

  updateMathObt(){
  this.mathJaxObject = this.mathJack.nativeGlobal()['MathJax'];
}

renderMath() {
  this.updateMathObt();
  let angObj = this;
  setTimeout(() => {
    angObj.mathJaxObject['Hub'].Queue(["Typeset", angObj.mathJaxObject.Hub], 'mathContent');
  },1000)
}
loadMathConfig() {
  this.updateMathObt();
  this.mathJaxObject.Hub.Config({
    showMathMenu: false,
    tex2jax: { inlineMath: [["$", "$"]],displayMath:[["$$", "$$"]] },
    menuSettings: { zoom: "Double-Click", zscale: "150%" },
    CommonHTML: { linebreaks: { automatic: true } },
    "HTML-CSS": { linebreaks: { automatic: true } },
    SVG: { linebreaks: { automatic: true } }
  });
}

//-------------------------------- END ---------------------------------/
}
