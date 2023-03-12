import { DependentElement } from '@living-papers/components';

export class TexMath extends DependentElement {
  static get dependencies() {
    return [
      {
        name: 'katex',
        version: '0.15.3',
        module: 'dist/katex.mjs',
        main: 'dist/katex.min.js',
        css: 'dist/katex.min.css'
      }
    ]
  }

  static get properties() {
    return {
      mode: { type: String },
      code: { type: String },
      maugs: { type: String },
      leqno: { type: Boolean },
      fleqn: { type: Boolean, converter: v => v !== 'false' },
      minRuleThickness: { type: Number },
      definitions: { type: Array }
    };
  }

  constructor() {
    super();
    this.mode = 'display';
    this.leqno = false;
    this.fleqn = false;
    this.definitions = this.hasAttribute('definitions') ? JSON.parse(this.getAttribute('definitions')) : [];
  }

  initialChildNodes(nodes) {
    // attempt to extract code from first child
    if (!this.hasAttribute('code') && nodes.length) {
      this.code = nodes[0].textContent;
    }
  }

  addAugmentations() {
    let code = this.maugs || this.code;
    for (let i = 0; i < this.definitions.length; i++) {
      const { replace, symbol, id } = this.definitions[i];
      code = code.replaceAll(replace, `\\htmlClass{maug maug-${id}}{${symbol}}`);
    }
    return code;
  }

  prepareMath() {
    return this.addAugmentations();
  }

  render() {
    const katex = this.getDependency('katex');
    if (!katex || !this.code) return;

    // See https://katex.org/docs/options.html
    const displayMode = this.mode === 'display';
    const options = {
      throwOnError: false,
      displayMode,
      leqno: this.leqno,
      fleqn: this.fleqn,
      minRuleThickness: this.minRuleThickness,
      trust: ({ command }) => command === '\\htmlClass',
      strict: (errorCode) => errorCode === "htmlExtension" ? "ignore" : "warn",
    };

    const root = document.createElement(displayMode ? 'div' : 'span');
    const math = this.prepareMath();
    katex.render(math, root, options);
    setTimeout(() => {
      const maugs = root.querySelectorAll('.enclosing');
      for (const el of maugs) {
        const id = [...el.classList].find(c => c.startsWith('maug-')).slice('maug-'.length);
        let { symbol, definition } = this.definitions.find(d => d.id === id);
        symbol = symbol.replaceAll('@', '');
        definition = definition.replaceAll('@', '');
        const maugWindow = document.createElement('span');
        maugWindow.className = 'math-aug-window';
        maugWindow.style.borderBottomColor = 'black';
        katex.render(`${symbol}:\\text{${definition}}`, maugWindow, {
          throwOnError: false,
          displayMode: false,
          leqno: this.leqno,
          fleqn: this.fleqn,
          minRuleThickness: this.minRuleThickness
        });
        el.addEventListener('focusout', () => {maugWindow.style.display = 'none';});
        el.addEventListener('keydown', (e) => {
          if (e.key == 'Enter') {
            maugWindow.style.display = 'inline-block';
            e.stopImmediatePropagation();
          } else if (e.key == 'Escape') {
            maugWindow.style.display = 'none';
          }
        });
        el.appendChild(maugWindow);
        maugWindow.appendChild(createPointerLine(el, maugWindow, displayMode));
        maugWindow.style.display = 'none';
        el.addEventListener('click', (e) => {
          maugWindow.style.display = 'inline-block';
          e.stopImmediatePropagation();
        });
        el.setAttribute("tabindex", 0);
      }
    }, 200);
    return root;
  }
}

function createPointerLine(element, window, displayMode) {
  const winRect = window.getBoundingClientRect();
  const elrect = element.getBoundingClientRect();
  const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', element.offsetWidth/2.0);
  circle.setAttribute('cy', elrect.y - winRect.y - element.offsetHeight);
  circle.setAttribute('r', 2);
  line.setAttribute('stroke', 'black');
  line.setAttribute('stroke-width', '1px');
  line.setAttribute('x1', element.offsetWidth/2.0);
  line.setAttribute('y1', elrect.y - winRect.y - element.offsetHeight);
  line.setAttribute('x2', winRect.x - elrect.x + window.offsetWidth/2.0);
  line.setAttribute('y2', displayMode ? 6:4);
  svg.setAttribute('style',
    `display:inline-block;position:absolute;
    transform:translate(-${winRect.x - elrect.x + window.offsetWidth-4}px,
    ${elrect.y - winRect.y - window.offsetHeight/2.0}px);
    width:${winRect.x - elrect.x + window.offsetWidth}px;
    height:${elrect.y - winRect.y - element.offsetHeight + 3}px;`);
  svg.appendChild(line);
  svg.appendChild(circle);
  return svg
}
