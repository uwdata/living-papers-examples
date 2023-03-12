import { TexMath } from './tex-math.js';

export class TexEquation extends TexMath {
  static get properties() {
    return {
      type: {type: String},
      nonumber: {type: Boolean},
      definitions: {type: Array}
    };
  }

  constructor() {
    super();
    this.mode = 'display';
    this.type = 'align';
    this.nonumber = false;
    this.definitions = this.hasAttribute('definitions') ? JSON.parse(this.getAttribute('definitions')) : [];
  }

  prepareMath() {
    const cmd = this.type + (this.nonumber ? '*' : '');
    return `\\begin{${cmd}}\n${super.prepareMath()}\n\\end{${cmd}}`;
  }
}
