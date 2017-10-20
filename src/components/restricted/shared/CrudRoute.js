import React, { createElement, PureComponent } from 'react';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import { Restricted } from 'admin-on-rest';
import Dialog from 'material-ui/Dialog';

class CrudRoute extends PureComponent {
  constructor(props) {
    super(props)
    this.state = { hiddenElement: true }
  }

  componentDidMount = () => {
    this.setState({hiddenElement: false})
  }

  componentWillUnmount = () => {
    this.setState({hiddenElement: true})
  }

  handleClose = () => {
    this.props.history.push('/')
  }

  render() {
    const { resource, list, create, edit, show, remove, options } = this.props;

    const commonProps = {
      resource,
      options,
      hasList: !!list,
      hasEdit: !!edit,
      hasShow: !!show,
      hasCreate: !!create,
      hasDelete: !!remove,
    };

    const restrictPage = (component, route) => {
      const RestrictedPage = routeProps => (
        <Restricted authParams={{ resource, route }} {...routeProps}>
          <Dialog bodyStyle={{ backgroundImage: '#fff' }} open={true} contentClassName={(this.state.hiddenElement) ? "" : "classReveal"}
                  contentStyle={{transform: '', transition: 'opacity 1s', opacity: 0}} onRequestClose={this.handleClose}>
          {createElement(component, {
            ...commonProps,
            ...routeProps,
          })}
          </Dialog>
        </Restricted>
      );
      return RestrictedPage;
    };
    return (
      <Switch style={{zIndex: 20000}}>
        {list && (
          <Route
            exact
            path={`/${resource}`}
            render={restrictPage(list, 'list')}
          />
        )}
        {create && (
          <Route
            exact
            path={`/${resource}/create`}
            render={restrictPage(create, 'create')}
          />
        )}
        {edit && (
          <Route
            exact
            path={`/${resource}/:id`}
            render={restrictPage(edit, 'edit')}
          />
        )}
        {show && (
          <Route
            exact
            path={`/${resource}/:id/show`}
            render={restrictPage(show, 'show')}
          />
        )}
        {remove && (
          <Route
            exact
            path={`/${resource}/:id/delete`}
            render={restrictPage(remove, 'delete')}
          />
        )}
      </Switch>
    );
  }
};

export default connect(null, {
})(CrudRoute);

