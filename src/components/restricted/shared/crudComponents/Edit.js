import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardText } from 'material-ui/Card';
import compose from 'recompose/compose';
import inflection from 'inflection';
import { translate } from 'admin-on-rest';
import { ViewTitle, Title } from 'admin-on-rest/lib/mui/layout';
import  EditActions  from 'admin-on-rest/lib/mui/detail/EditActions';
// import {
//   crudGetOne as crudGetOneAction,
//   crudUpdate as crudUpdateAction,
// } from '../../actions/dataActions';
// import withPermissionsFilteredChildren from '../../auth/withPermissionsFilteredChildren';

export class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      key: 0,
      record: props.data,
    };
    console.debug("recordrecordrecordsrecord", this.state.record)
    this.previousKey = 0;
  }

  componentDidMount() {
    this.updateData();
  }

  componentWillReceiveProps(nextProps) {
    console.debug("willreceiveprops", nextProps)
    if (this.props.data !== nextProps.data) {
      this.setState({ record: nextProps.data }); // FIXME: erases user entry when fetch response arrives late
      if (this.fullRefresh) {
        this.fullRefresh = false;
        this.setState({ key: this.state.key + 1 });
      }
    }
    if (
      this.props.id !== nextProps.id ||
      nextProps.version !== this.props.version
    ) {
      this.updateData(nextProps.resource, nextProps.id);
    }
  }

  getBasePath() {
    const { location } = this.props;
    return location.pathname
      .split('/')
      .slice(0, -1)
      .join('/');
  }

  defaultRedirectRoute() {
    return 'list';
  }

  updateData(resource = this.props.resource, id = this.props.id) {
    console.debug("updateData with props", this.props)
    // this.props.crudGetOne(resource, id, this.getBasePath());
  }

  save = (record, redirect) => {

    console.debug("savedata with record/props", record,this.props)
    // this.props.crudUpdate(
    //   this.props.resource,
    //   this.props.id,
    //   record,
    //   this.props.data,
    //   this.getBasePath(),
    //   redirect
    // );
  };

  render() {
    console.debug("render with props",this.props)
    const {
      actions = <EditActions />,
      children,
      data,
      hasDelete,
      hasShow,
      id,
      isLoading,
      resource,
      title,
      translate,
    } = this.props;

    // const data = { id: "daumann", username: "daumann", _id: "daumann"}

    if (!children) return null;

    const basePath = this.getBasePath();

    const resourceName = translate(`resources.${resource}.name`, {
      smart_count: 1,
      _: inflection.humanize(inflection.singularize(resource)),
    });
    const defaultTitle = translate('aor.page.edit', {
      name: `${resourceName}`,
      id,
      data,
    });
    const titleElement = data ? (
        <Title title={title} record={data} defaultTitle={defaultTitle} />
      ) : (
        ''
      );

    return (
      <div className="edit-page">
        <Card style={{ opacity: isLoading ? 0.8 : 1 }}>
          {actions &&
          React.cloneElement(actions, {
            basePath,
            data,
            hasDelete,
            hasShow,
            resource,
          })}
          <ViewTitle title={titleElement} />
          {data &&
          React.cloneElement(children, {
            save: this.save,
            resource,
            basePath,
            record: data,
            translate,
            redirect:
              typeof children.props.redirect === 'undefined'
                ? this.defaultRedirectRoute()
                : children.props.redirect,
          })}
          {!data && <CardText>&nbsp;</CardText>}
        </Card>
      </div>
    );
  }
}

Edit.propTypes = {
  actions: PropTypes.element,
  children: PropTypes.node,
  // crudGetOne: PropTypes.func.isRequired,
  // crudUpdate: PropTypes.func.isRequired,
  data: PropTypes.object,
  hasDelete: PropTypes.bool,
  hasShow: PropTypes.bool,
  id: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  resource: PropTypes.string.isRequired,
  title: PropTypes.any,
  translate: PropTypes.func,
  version: PropTypes.number.isRequired,
};

function mapStateToProps(state, props) {
  console.debug(state.admin.resources[props.resource]
    ? console.debug(JSON.stringify(state.admin.resources[props.resource].data[
      decodeURIComponent(props.match.params.id)
      ]))
    : null)
  return {
    id: decodeURIComponent(props.match.params.id),
    data: state.admin.resources[props.resource]
      ? state.admin.resources[props.resource].data[
        decodeURIComponent(props.match.params.id)
        ]
      : null,
    isLoading: state.admin.loading > 0,
    version: state.admin.ui.viewVersion,
  };
}

const enhance = compose(
  connect(mapStateToProps, {
    // crudGetOne: crudGetOneAction,
    // crudUpdate: crudUpdateAction,
  }),
  translate,
  // withPermissionsFilteredChildren
);

export default enhance(Edit);
