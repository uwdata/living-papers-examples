import { html } from 'lit';
import { ArticleElement } from '@living-papers/components';

export class OptionText extends ArticleElement {
  static get properties() {
    return {
      index: {type: Number},
      options: {type: Array},
      span: {type: Number},
      title: {type: String},
      prefix: {type: String},
      suffix: {type: String}
    };
  }

  constructor() {
    super();
    this.index = 0;
    this.options = [];
    this.span = 1;
    this.title = 'Draggable text';
    this.prefix = '';
    this.suffix = '';
    this.addEventListener('click', e => e.stopPropagation());
    this.addEventListener('mousedown', e => this.onMouseDown(e));
  }

  initialChildNodes(nodes) {
    if (nodes.length) this.options = nodes;
    this.value = this.options[0];
  }

  onMouseDown(e) {
    e.stopImmediatePropagation();
    const mx = e.x;
    const mv = this.index;

    const cursor = this.ownerDocument.body.style.cursor;
    this.ownerDocument.body.style.cursor = 'ew-resize';

    const select = this.style.MozUserSelect;
    this.style.MozUserSelect = 'none';

    const move = e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const dx = Math.round((e.x - mx) / this.span);
      const index = Math.max(Math.min(mv + dx, this.options.length - 1), 0);
      if (this.index !== index) {
        this.index = index;
        this.value = this.options[index];
        this.dispatchEvent(new Event('input'));
        this.requestUpdate();
      }
    };

    const up = e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.ownerDocument.body.style.cursor = cursor;
      this.style.MozUserSelect = select;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }

  render() {
    const opt = this.options[this.index];
    return html`<span class="option-text" title=${this.title}>${this.prefix}${opt}${this.suffix}</span>`;
  }
}
