// import React from 'react'
// import ReactDOM from 'react-dom'
//
// export default class PortalYear extends React.Component {
//   constructor(props) {
//     super(props);
//     this.el = document.querySelector('.vis-custom-time.selectedYear');
//   }
//
//   componentDidMount() {
//     // The portal element is inserted in the DOM tree after
//     // the Modal's children are mounted, meaning that children
//     // will be mounted on a detached DOM node. If a child
//     // component requires to be attached to the DOM tree
//     // immediately when mounted, for example to measure a
//     // DOM node, or uses 'autoFocus' in a descendant, add
//     // state to Modal and only render the children when Modal
//     // is inserted in the DOM tree.
//
//     // modalRoot.appendChild(this.el);
//   }
//
//   componentWillUnmount() {
//     // modalRoot.removeChild(this.el);
//   }
//
//   render() {
//     return ReactDOM.createPortal(
//       this.props.children,
//       this.el,
//     );
//   }
// }

import React from 'react';
import ReactDOM from 'react-dom';

class PortalYear extends React.Component {
  componentWillUnmount() {
    if (this.defaultNode) {
      document.body.removeChild(this.defaultNode);
    }
    this.defaultNode = null;
  }

  render() {
    if (!(
        typeof window !== 'undefined' &&
        window.document &&
        window.document.createElement
      )) {
      return null;
    }
    if (!this.props.node && !this.defaultNode) {
      this.defaultNode = document.createElement('div');
      document.body.appendChild(this.defaultNode);
    }
    return ReactDOM.createPortal(
      this.props.children,
      this.props.node || this.defaultNode
    );
  }
}

export default PortalYear;
