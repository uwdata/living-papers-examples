import { ArticleElement } from '@living-papers/components';

export class ShowText extends ArticleElement {
  static get properties() {
    return {
      if: {type: Boolean, converter: v => v && v !== 'false'}
    };
  }

  constructor() {
    super();
    this.if = true;
  }

  render() {
    return this.if ? this.__children : '';
  }
}
