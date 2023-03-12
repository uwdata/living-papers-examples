import {
  visitNodes, getPropertyValue, setValueProperty,
  removeChild, getNodeName, getChildren, extractText
} from '@living-papers/ast';

export default function(ast) {
  let definitions = [];

  visitNodes(ast.article, (node, parent) => {
    if (node.name === 'definitions') {
      const lines = getChildren(node)
        .map(child => extractText(child).trim().split('\n'))
        .flat()
        .map(line => {
          const parts = line.split(':');
          if (parts.length != 3) {
            // TODO: handle incorrect parsing
            return null;
          }
          let replace = parts[0].trim();
          let id = parts[1].trim() || null;
          let definition = parts[2].trim();
          let symbol = replace.replace(/^@+/, '');
          return {
            replace,
            symbol,
            id,
            definition,
          };
        });
      definitions = definitions.concat(lines);
      removeChild(parent, node);
    }
  });

  // TODO: sort definitions so that superstrings are before substrings
  definitions
    .sort((b, a) => a.replace.length - b.replace.length)
    .map((d, i) => ({ ...d, id: d.id || i}));

  // console.log('IDs =\n', [...new Set(definitions.map(d => d.id))].join('\n'));

  definitions = JSON.stringify(definitions);

  visitNodes(ast.article, (node) => {
    if (['math', 'equation'].includes(getNodeName(node))) {
      const codeProp = getPropertyValue(node, 'code');
      const maugCode = codeProp ?? node.children[0].value;
      const code = maugCode.replaceAll('@', '');
      if (maugCode !== code) {
        setValueProperty(node, 'maugs', maugCode);
        if (codeProp) {
          setValueProperty(node, 'code', code);
        } else {
          node.children[0].value = code;
        }
        setValueProperty(node, 'definitions', definitions);
      }
    }
  });

  return ast;
}
